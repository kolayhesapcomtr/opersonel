import prisma from '../../database/prisma';
import { EmploymentStatus } from '@prisma/client';

export class DashboardService {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(tenantId: string) {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      totalDepartments,
      totalPositions,
      recentHires,
    ] = await Promise.all([
      // Total employees
      prisma.employee.count({
        where: { tenantId, isActive: true },
      }),

      // Active employees
      prisma.employee.count({
        where: {
          tenantId,
          status: EmploymentStatus.ACTIVE,
          isActive: true,
        },
      }),

      // On leave employees
      prisma.employee.count({
        where: {
          tenantId,
          status: EmploymentStatus.ON_LEAVE,
          isActive: true,
        },
      }),

      // Total departments
      prisma.department.count({
        where: { tenantId, isActive: true },
      }),

      // Total positions
      prisma.position.count({
        where: { tenantId, isActive: true },
      }),

      // Recent hires (last 30 days)
      prisma.employee.count({
        where: {
          tenantId,
          isActive: true,
          hireDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get employees by department (top 5)
    const employeesByDepartment = await prisma.department.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        employees: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get employees by employment type
    const employeesByType = await prisma.employee.groupBy({
      by: ['employmentType'],
      where: { tenantId, isActive: true },
      _count: true,
    });

    // Get recent employees (last 10)
    const recentEmployees = await prisma.employee.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNumber: true,
        hireDate: true,
        department: {
          select: {
            name: true,
          },
        },
        position: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        hireDate: 'desc',
      },
      take: 10,
    });

    return {
      overview: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        totalDepartments,
        totalPositions,
        recentHires,
      },
      employeesByDepartment: employeesByDepartment.map((dept) => ({
        departmentId: dept.id,
        departmentName: dept.name,
        count: dept._count.employees,
      })),
      employeesByType: employeesByType.map((item) => ({
        type: item.employmentType,
        count: item._count,
      })),
      recentEmployees,
    };
  }
}

export default new DashboardService();
