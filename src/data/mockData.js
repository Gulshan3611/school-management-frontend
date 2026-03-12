export const mockDashboardStats = {
  totalStudents: 2450,
  totalTeachers: 112,
  attendanceToday: 92.5,
  feeCollection: 85, // percentage
  upcomingEvents: [
    { id: 1, title: 'Half-Yearly Exams Commence', date: '15 Sep 2025', type: 'exam' },
    { id: 2, title: 'Gandhi Jayanti Holiday', date: '02 Oct 2025', type: 'holiday' },
    { id: 3, title: 'Parent Teacher Meeting (PTM)', date: '10 Oct 2025', type: 'event' },
    { id: 4, title: 'Diwali Break Starts', date: '18 Oct 2025', type: 'holiday' },
  ],
  notices: [
    { id: 1, title: 'Revised Bus Route for Sector 14', date: '05 Sep 2025', urgency: 'high' },
    { id: 2, title: 'CBSE Registration Circular for Class X', date: '02 Sep 2025', urgency: 'high' },
    { id: 3, title: 'Inter-school Debate Competition Results', date: '01 Sep 2025', urgency: 'low' },
  ]
};
