import prisma from '../../lib/prismaClient';

// Helper function to generate slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.supplier.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ========== CUSTOMER FUNCTIONS ==========

export async function createSubmission(
  customerId: number,
  payload: {
    companyName: string;
    companyAddress: string;
    contactEmail: string;
    contactPhone?: string;
    website?: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    socialMedia?: any;
    ownershipDocuments?: string[];
    notes?: string;
  }
) {
  // Check for duplicate submission (same customer + company name)
  const existing = await prisma.supplierSubmission.findFirst({
    where: {
      customerId,
      companyName: payload.companyName,
      status: {
        in: ['pending', 'approved'],
      },
    },
  });

  if (existing) {
    throw new Error('You have already submitted this company for review');
  }

  const submission = await prisma.supplierSubmission.create({
    data: {
      customerId,
      companyName: payload.companyName,
      companyAddress: payload.companyAddress,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      website: payload.website,
      description: payload.description,
      logoUrl: payload.logoUrl,
      bannerUrl: payload.bannerUrl,
      socialMedia: payload.socialMedia,
      ownershipDocuments: payload.ownershipDocuments || [],
      notes: payload.notes,
      status: 'pending',
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return submission;
}

export async function getCustomerSubmissions(customerId: number) {
  const submissions = await prisma.supplierSubmission.findMany({
    where: {
      customerId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return submissions;
}

export async function getSubmissionById(submissionId: number, customerId: number) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: {
      id: submissionId,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Verify ownership
  if (submission.customerId !== customerId) {
    throw new Error('You do not have permission to view this submission');
  }

  return submission;
}

export async function updateSubmission(
  submissionId: number,
  customerId: number,
  payload: {
    companyName?: string;
    companyAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    socialMedia?: any;
    ownershipDocuments?: string[];
    notes?: string;
  }
) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Verify ownership
  if (submission.customerId !== customerId) {
    throw new Error('You do not have permission to update this submission');
  }

  // Can only update pending submissions
  if (submission.status !== 'pending') {
    throw new Error('Can only update submissions with pending status');
  }

  const updated = await prisma.supplierSubmission.update({
    where: { id: submissionId },
    data: {
      companyName: payload.companyName,
      companyAddress: payload.companyAddress,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      website: payload.website,
      description: payload.description,
      logoUrl: payload.logoUrl,
      bannerUrl: payload.bannerUrl,
      socialMedia: payload.socialMedia,
      ownershipDocuments: payload.ownershipDocuments,
      notes: payload.notes,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return updated;
}

export async function deleteSubmission(submissionId: number, customerId: number) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Verify ownership
  if (submission.customerId !== customerId) {
    throw new Error('You do not have permission to delete this submission');
  }

  // Can only delete pending submissions
  if (submission.status !== 'pending') {
    throw new Error('Can only delete submissions with pending status');
  }

  await prisma.supplierSubmission.delete({
    where: { id: submissionId },
  });

  return { message: 'Submission deleted successfully' };
}

// ========== ADMIN FUNCTIONS ==========

export async function getAllSubmissions(
  status?: string,
  page: number = 1,
  limit: number = 20
) {
  const where: any = {};

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    prisma.supplierSubmission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.supplierSubmission.count({ where }),
  ]);

  return {
    submissions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approveSubmission(submissionId: number, adminNotes?: string) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status === 'approved') {
    throw new Error('Submission is already approved');
  }

  // Generate unique slug from company name
  const baseSlug = generateSlug(submission.companyName);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  // Create Supplier from submission
  const supplier = await prisma.supplier.create({
    data: {
      name: submission.companyName,
      slug: uniqueSlug,
      description: submission.description,
      website: submission.website,
      phone: submission.contactPhone,
      email: submission.contactEmail,
      logoImage: submission.logoUrl,
      heroImage: submission.bannerUrl,
      // Initialize with default values
      homeRank: 0,
    },
  });

  // Update submission status
  const updatedSubmission = await prisma.supplierSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'approved',
      adminNotes,
      reviewedAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return {
    submission: updatedSubmission,
    supplier,
  };
}

export async function rejectSubmission(submissionId: number, adminNotes: string) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status === 'rejected') {
    throw new Error('Submission is already rejected');
  }

  const updated = await prisma.supplierSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'rejected',
      adminNotes,
      reviewedAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return updated;
}

export async function deleteSubmissionAdmin(submissionId: number) {
  const submission = await prisma.supplierSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  await prisma.supplierSubmission.delete({
    where: { id: submissionId },
  });

  return { message: 'Submission deleted successfully by admin' };
}
