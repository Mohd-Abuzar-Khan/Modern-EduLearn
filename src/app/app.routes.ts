import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { AuthComponent } from './auth/auth.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { LessonPlayerComponent } from './course/lesson-player.component';
import { DashboardShellComponent } from './shared/dashboard-shell.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeComponent } from './home/home.component';
import { InfoPageComponent } from './shared/info-page.component';

// Student
import { StudentCertificatesComponent } from './student/certificates.component';
import { StudentDashboardComponent } from './student/dashboard.component';
import { StudentExploreComponent } from './student/explore.component';
import { StudentMyCoursesComponent } from './student/my-courses.component';
import { StudentProfileComponent } from './student/profile.component';
import { StudentProgressComponent } from './student/progress.component';

// Instructor
import { InstructorCreateCourseComponent } from './instructor/create-course.component';
import { InstructorDashboardComponent } from './instructor/dashboard.component';
import { InstructorMyCoursesComponent } from './instructor/my-courses.component';
import { InstructorProfileComponent } from './instructor/profile.component';
import { InstructorStudentsComponent } from './instructor/students.component';

// Admin
import { AdminDashboardComponent } from './admin/dashboard.component';
import { AdminCoursesComponent } from './admin/courses.component';
import { AdminUsersComponent } from './admin/users.component';
import { AdminApproveCoursesComponent } from './admin/approve-courses.component';
import { AdminAnalyticsComponent } from './admin/analytics.component';

// Shared
import { DiscussionComponent } from './shared/discussion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'course/:courseId', component: CourseDetailComponent },
  {
    path: 'course/:courseId/lesson/:lessonId',
    component: LessonPlayerComponent,
    canActivate: [authGuard],
  },

  // Student routes
  {
    path: 'student',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    data: { role: 'STUDENT' },
    children: [
      { path: '', component: StudentDashboardComponent },
      { path: 'my-courses', component: StudentMyCoursesComponent },
      { path: 'explore', component: StudentExploreComponent },
      { path: 'certificates', component: StudentCertificatesComponent },
      { path: 'profile', component: StudentProfileComponent },
      { path: 'discussion', component: DiscussionComponent },
      { path: 'progress', component: StudentProgressComponent },
    ],
  },

  // Instructor routes
  {
    path: 'instructor',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    data: { role: 'INSTRUCTOR' },
    children: [
      { path: '', component: InstructorDashboardComponent },
      { path: 'my-courses', component: InstructorMyCoursesComponent },
      { path: 'create-course', component: InstructorCreateCourseComponent },
      { path: 'students', component: InstructorStudentsComponent },
      { path: 'discussion', component: DiscussionComponent },
      { path: 'profile', component: InstructorProfileComponent },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'courses', component: AdminCoursesComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'approve-courses', component: AdminApproveCoursesComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];
