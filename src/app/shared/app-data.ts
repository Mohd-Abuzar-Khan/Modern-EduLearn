export interface CourseCard {
  id: number;
  title: string;
  instructor: string;
  badge: string;
  price: string;
  rating: number;
  students: number;
  category: string;
  description: string;
  gradient: string;
}

export interface CurriculumSection {
  id: number;
  title: string;
  lessons: { id: number; title: string; duration: string }[];
}

export interface NavItem {
  label: string;
  path: string;
}

export const courseCategories = ['All', 'Design', 'Development', 'Business', 'Marketing'];

export const featuredCourses: CourseCard[] = [
  {
    id: 1,
    title: 'Design Systems That Scale',
    instructor: 'Ariana Miles',
    badge: 'Advanced',
    price: '$89',
    rating: 4.9,
    students: 1842,
    category: 'Design',
    description: 'Build reusable visual systems with practical patterns and real product examples.',
    gradient: 'linear-gradient(135deg, #2f5531 0%, #5d8b5f 45%, #d8e7c3 100%)',
  },
  {
    id: 2,
    title: 'Modern Frontend Architecture',
    instructor: 'Noah Reed',
    badge: 'Beginner',
    price: '$79',
    rating: 4.8,
    students: 1324,
    category: 'Development',
    description: 'Structure production apps with routing, shared state, and resilient component boundaries.',
    gradient: 'linear-gradient(135deg, #1f3d23 0%, #43694d 50%, #b7d3b1 100%)',
  },
  {
    id: 3,
    title: 'Growth Strategy Playbook',
    instructor: 'Leah Stone',
    badge: 'Intermediate',
    price: '$69',
    rating: 4.7,
    students: 941,
    category: 'Business',
    description: 'Validate products, position offers, and design a repeatable growth loop.',
    gradient: 'linear-gradient(135deg, #28402c 0%, #56745b 52%, #d4dfbf 100%)',
  },
  {
    id: 4,
    title: 'Content That Converts',
    instructor: 'Maya Patel',
    badge: 'Beginner',
    price: '$59',
    rating: 4.6,
    students: 780,
    category: 'Marketing',
    description: 'Create campaigns, landing pages, and email journeys that turn attention into action.',
    gradient: 'linear-gradient(135deg, #203522 0%, #4c734a 46%, #d6e4c7 100%)',
  },
];

export const curriculum: CurriculumSection[] = [
  {
    id: 1,
    title: 'Foundations',
    lessons: [
      { id: 1, title: 'Course overview', duration: '8 min' },
      { id: 2, title: 'Workflow setup', duration: '12 min' },
      { id: 3, title: 'Core concepts', duration: '15 min' },
    ],
  },
  {
    id: 2,
    title: 'Building the system',
    lessons: [
      { id: 1, title: 'Designing modules', duration: '18 min' },
      { id: 2, title: 'Reusable patterns', duration: '22 min' },
      { id: 3, title: 'Polishing interactions', duration: '16 min' },
    ],
  },
  {
    id: 3,
    title: 'Shipping to production',
    lessons: [
      { id: 1, title: 'Testing the experience', duration: '14 min' },
      { id: 2, title: 'Deployment checklist', duration: '10 min' },
      { id: 3, title: 'Launch review', duration: '9 min' },
    ],
  },
];

export const instructorStats = [
  { label: 'Total Students', value: '12.8K' },
  { label: 'Published Courses', value: '24' },
  { label: 'Monthly Revenue', value: '$18.4K' },
  { label: 'Avg Rating', value: '4.9' },
];

export const instructorRecentCourses = featuredCourses.slice(0, 3);

export const instructorCourseRows = [
  { title: 'Design Systems That Scale', status: 'Published', students: 1842, lessons: 18, revenue: '$6,480', updated: '2d ago' },
  { title: 'Modern Frontend Architecture', status: 'Draft', students: 1324, lessons: 21, revenue: '$5,220', updated: '5d ago' },
  { title: 'Content That Converts', status: 'Published', students: 780, lessons: 13, revenue: '$2,140', updated: '1w ago' },
];

export const instructorNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/instructor' },
  { label: 'My Courses', path: '/instructor/my-courses' },
  { label: 'Create Course', path: '/instructor/create-course' },
  { label: 'Students', path: '/instructor/students' },
  { label: 'Discussion', path: '/instructor/discussion' },
  { label: 'Profile', path: '/instructor/profile' },
];

export const studentNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/student' },
  { label: 'My Courses', path: '/student/my-courses' },
  { label: 'Explore', path: '/student/explore' },
  { label: 'Certificates', path: '/student/certificates' },
  { label: 'Progress', path: '/student/progress' },
  { label: 'Discussion', path: '/student/discussion' },
  { label: 'Profile', path: '/student/profile' },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Approve Courses', path: '/admin/approve-courses' },
  { label: 'All Courses', path: '/admin/courses' },
  { label: 'Analytics', path: '/admin/analytics' },
];
