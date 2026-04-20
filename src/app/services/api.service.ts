import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const GATEWAY = (environment.apiBaseUrl || '').replace(/\/$/, '');

export const API_BASE = {
  AUTH: GATEWAY,
  COURSE: GATEWAY,
  ENROLLMENT: GATEWAY,
  LESSON: GATEWAY,
  PROGRESS: GATEWAY,
  ASSESSMENT: GATEWAY,
  PAYMENT: GATEWAY,
  NOTIFICATION: GATEWAY,
  DISCUSSION: GATEWAY,
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // AUTH
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${API_BASE.AUTH}/auth/login`, { email, password });
  }
  register(email: string, fullName: string, password: string, role: string): Observable<any> {
    return this.http.post(`${API_BASE.AUTH}/auth/register`, { email, fullName, password, role });
  }
  validateToken(token: string): Observable<any> {
    return this.http.get(`${API_BASE.AUTH}/auth/validate?token=${token}`);
  }
  refreshToken(token: string): Observable<any> {
    return this.http.post(`${API_BASE.AUTH}/auth/refresh?token=${token}`, {});
  }


  // COURSES
  getAllCourses(): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses`);
  }
  getCourseById(id: number): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/${id}`);
  }
  searchCourses(keyword: string): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/search?keyword=${keyword}`);
  }
  getCoursesByCategory(category: string): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/category/${category}`);
  }
  getFeaturedCourses(): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/featured`);
  }
  getCoursesByInstructor(instructorId: number): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/instructor/${instructorId}`, { headers: this.headers() });
  }
  getAllCoursesAdmin(): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/all`, { headers: this.headers() });
  }
  createCourse(course: any): Observable<any> {
    return this.http.post(`${API_BASE.COURSE}/api/v1/courses`, course, { headers: this.headers() });
  }
  updateCourse(id: number, course: any): Observable<any> {
    return this.http.put(`${API_BASE.COURSE}/api/v1/courses/${id}`, course, { headers: this.headers() });
  }
  publishCourse(id: number): Observable<any> {
    return this.http.put(`${API_BASE.COURSE}/api/v1/courses/${id}/publish`, {}, { headers: this.headers() });
  }
  approveCourse(id: number): Observable<any> {
    return this.http.put(`${API_BASE.COURSE}/api/v1/courses/${id}/approve`, {}, { headers: this.headers() });
  }
  rejectCourse(id: number, reason: string): Observable<any> {
    return this.http.put(`${API_BASE.COURSE}/api/v1/courses/${id}/reject?reason=${encodeURIComponent(reason)}`, {}, { headers: this.headers() });
  }
  getPendingCourses(): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/pending`, { headers: this.headers() });
  }
  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${API_BASE.COURSE}/api/v1/courses/${id}`, { headers: this.headers() });
  }

  // ENROLLMENTS
  enroll(studentId: number, courseId: number): Observable<any> {
    return this.http.post(`${API_BASE.ENROLLMENT}/api/v1/enrollments/enroll`, { studentId, courseId }, { headers: this.headers() });
  }
  unenroll(enrollmentId: number): Observable<any> {
    return this.http.delete(`${API_BASE.ENROLLMENT}/api/v1/enrollments/${enrollmentId}`, { headers: this.headers() });
  }
  getEnrollmentsByStudent(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.ENROLLMENT}/api/v1/enrollments/student/${studentId}`, { headers: this.headers() });
  }
  getEnrollmentsByCourse(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.ENROLLMENT}/api/v1/enrollments/course/${courseId}`, { headers: this.headers() });
  }
  updateEnrollmentProgress(studentId: number, courseId: number, progressPercent: number): Observable<any> {
    return this.http.put(`${API_BASE.ENROLLMENT}/api/v1/enrollments/progress`, { studentId, courseId, progressPercent }, { headers: this.headers() });
  }
  checkEnrolled(studentId: number, courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.ENROLLMENT}/api/v1/enrollments/check?studentId=${studentId}&courseId=${courseId}`, { headers: this.headers() });
  }
  getEnrollmentCount(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.ENROLLMENT}/api/v1/enrollments/count/${courseId}`, { headers: this.headers() });
  }
  markEnrollmentComplete(enrollmentId: number): Observable<any> {
    return this.http.put(`${API_BASE.ENROLLMENT}/api/v1/enrollments/complete/${enrollmentId}`, {}, { headers: this.headers() });
  }

  // LESSONS
  getLessonsByCourse(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.LESSON}/api/v1/lessons/course/${courseId}`, { headers: this.headers() });
  }
  getLessonById(lessonId: number): Observable<any> {
    return this.http.get(`${API_BASE.LESSON}/api/v1/lessons/${lessonId}`, { headers: this.headers() });
  }
  getPreviewLessons(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.LESSON}/api/v1/lessons/preview/${courseId}`);
  }
  addLesson(lesson: any): Observable<any> {
    return this.http.post(`${API_BASE.LESSON}/api/v1/lessons`, lesson, { headers: this.headers() });
  }
  updateLesson(lessonId: number, lesson: any): Observable<any> {
    return this.http.put(`${API_BASE.LESSON}/api/v1/lessons/${lessonId}`, lesson, { headers: this.headers() });
  }
  deleteLesson(lessonId: number): Observable<any> {
    return this.http.delete(`${API_BASE.LESSON}/api/v1/lessons/${lessonId}`, { headers: this.headers() });
  }
  reorderLessons(courseId: number, lessonIds: number[]): Observable<any> {
    return this.http.put(`${API_BASE.LESSON}/api/v1/lessons/reorder/${courseId}`, lessonIds, { headers: this.headers() });
  }
  addResource(lessonId: number, resource: any): Observable<any> {
    return this.http.post(`${API_BASE.LESSON}/api/v1/lessons/${lessonId}/resources`, resource, { headers: this.headers() });
  }
  removeResource(resourceId: number): Observable<any> {
    return this.http.delete(`${API_BASE.LESSON}/api/v1/lessons/resources/${resourceId}`, { headers: this.headers() });
  }

  uploadLessonVideo(file: File, courseId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', String(courseId));
    // Note: Don't set Content-Type header — the browser sets it with boundary automatically
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post(`${API_BASE.LESSON}/api/v1/lessons/upload-video`, formData, { headers });
  }

  uploadLessonPdf(file: File, courseId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', String(courseId));
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post(`${API_BASE.LESSON}/api/v1/lessons/upload-pdf`, formData, { headers });
  }

  getLessonCount(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.LESSON}/api/v1/lessons/count/${courseId}`, { headers: this.headers() });
  }

  // PROGRESS
  trackProgress(studentId: number, courseId: number, lessonId: number, watchedSeconds: number): Observable<any> {
    return this.http.put(`${API_BASE.PROGRESS}/api/v1/progress/track`, { studentId, courseId, lessonId, watchedSeconds }, { headers: this.headers() });
  }
  markLessonComplete(studentId: number, courseId: number, lessonId: number): Observable<any> {
    return this.http.put(`${API_BASE.PROGRESS}/api/v1/progress/complete`, { studentId, courseId, lessonId }, { headers: this.headers() });
  }
  getCourseProgress(studentId: number, courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.PROGRESS}/api/v1/progress/course?studentId=${studentId}&courseId=${courseId}`, { headers: this.headers() });
  }
  getLessonProgress(studentId: number, lessonId: number): Observable<any> {
    return this.http.get(`${API_BASE.PROGRESS}/api/v1/progress/lesson?studentId=${studentId}&lessonId=${lessonId}`, { headers: this.headers() });
  }
  getAllProgressByStudent(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.PROGRESS}/api/v1/progress/all/${studentId}`, { headers: this.headers() });
  }
  issueCertificate(studentId: number, courseId: number): Observable<any> {
    return this.http.post(`${API_BASE.PROGRESS}/api/v1/progress/certificates/issue?studentId=${studentId}&courseId=${courseId}`, {}, { headers: this.headers() });
  }
  getStudentCertificates(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.PROGRESS}/api/v1/progress/certificates/student/${studentId}`, { headers: this.headers() });
  }
  verifyCertificate(verificationCode: string): Observable<any> {
    return this.http.get(`${API_BASE.PROGRESS}/api/v1/progress/certificates/verify/${verificationCode}`);
  }

  // ASSESSMENTS
  createQuiz(quiz: any): Observable<any> {
    return this.http.post(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz`, quiz, { headers: this.headers() });
  }
  getQuizById(quizId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}`, { headers: this.headers() });
  }
  getQuizzesByCourse(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/course/${courseId}/quizzes`, { headers: this.headers() });
  }
  updateQuiz(quizId: number, quiz: any): Observable<any> {
    return this.http.put(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}`, quiz, { headers: this.headers() });
  }
  deleteQuiz(quizId: number): Observable<any> {
    return this.http.delete(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}`, { headers: this.headers() });
  }
  publishQuiz(quizId: number): Observable<any> {
    return this.http.post(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}/publish`, {}, { headers: this.headers() });
  }
  addQuestion(quizId: number, question: any): Observable<any> {
    return this.http.post(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}/question`, question, { headers: this.headers() });
  }
  getQuestionsByQuiz(quizId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}/questions`, { headers: this.headers() });
  }
  updateQuestion(questionId: number, question: any): Observable<any> {
    return this.http.put(`${API_BASE.ASSESSMENT}/api/v1/assessments/question/${questionId}`, question, { headers: this.headers() });
  }
  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${API_BASE.ASSESSMENT}/api/v1/assessments/question/${questionId}`, { headers: this.headers() });
  }
  startAttempt(quizId: number, studentId: number): Observable<any> {
    return this.http.post(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}/start`, { studentId }, { headers: this.headers() });
  }
  submitAttempt(attemptId: number, answers: Record<number, string>): Observable<any> {
    return this.http.post(`${API_BASE.ASSESSMENT}/api/v1/assessments/attempt/${attemptId}/submit`, answers, { headers: this.headers() });
  }
  getAttemptsByStudent(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/student/${studentId}/attempts`, { headers: this.headers() });
  }
  getAttemptsByQuiz(quizId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/quiz/${quizId}/attempts`, { headers: this.headers() });
  }
  getBestScore(studentId: number, quizId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/student/${studentId}/quiz/${quizId}/best`, { headers: this.headers() });
  }
  getAttemptById(attemptId: number): Observable<any> {
    return this.http.get(`${API_BASE.ASSESSMENT}/api/v1/assessments/attempt/${attemptId}`, { headers: this.headers() });
  }

  // PAYMENTS
  createPaymentOrder(studentId: number, courseId: number, amount: number): Observable<any> {
    return this.http.post(`${API_BASE.PAYMENT}/api/v1/payments/create-order`, { studentId, courseId, amount }, { headers: this.headers() });
  }

  getRazorpayKey(): Observable<any> {
    return this.http.get(`${API_BASE.PAYMENT}/api/v1/payments/razorpay-key`, { headers: this.headers() });
  }

  verifyPayment(data: any): Observable<any> {
    return this.http.post(`${API_BASE.PAYMENT}/api/v1/payments/verify`, data, { headers: this.headers() });
  }
  getPaymentHistory(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.PAYMENT}/api/v1/payments/student/${studentId}`, { headers: this.headers() });
  }
  refundPayment(paymentId: number): Observable<any> {
    return this.http.post(`${API_BASE.PAYMENT}/api/v1/payments/refund/${paymentId}`, {}, { headers: this.headers() });
  }
  subscribe(studentId: number, plan: string): Observable<any> {
    return this.http.post(`${API_BASE.PAYMENT}/api/v1/payments/subscriptions/subscribe`, { studentId, plan }, { headers: this.headers() });
  }
  cancelSubscription(studentId: number): Observable<any> {
    return this.http.delete(`${API_BASE.PAYMENT}/api/v1/payments/subscriptions/cancel/${studentId}`, { headers: this.headers() });
  }
  getSubscriptionStatus(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.PAYMENT}/api/v1/payments/subscriptions/status/${studentId}`, { headers: this.headers() });
  }
  getSubscriptionDetails(studentId: number): Observable<any> {
    return this.http.get(`${API_BASE.PAYMENT}/api/v1/payments/subscriptions/student/${studentId}`, { headers: this.headers() });
  }

  // NOTIFICATIONS
  getNotifications(userId: number): Observable<any> {
    return this.http.get(`${API_BASE.NOTIFICATION}/api/v1/notifications/user/${userId}`, { headers: this.headers() });
  }
  getUnreadCount(userId: number): Observable<any> {
    return this.http.get(`${API_BASE.NOTIFICATION}/api/v1/notifications/unread-count/${userId}`, { headers: this.headers() });
  }
  getUnreadNotifications(userId: number): Observable<any> {
    return this.http.get(`${API_BASE.NOTIFICATION}/api/v1/notifications/unread/${userId}`, { headers: this.headers() });
  }
  markNotificationRead(notificationId: number): Observable<any> {
    return this.http.put(`${API_BASE.NOTIFICATION}/api/v1/notifications/${notificationId}/read`, {}, { headers: this.headers() });
  }
  markAllNotificationsRead(userId: number): Observable<any> {
    return this.http.put(`${API_BASE.NOTIFICATION}/api/v1/notifications/read-all/${userId}`, {}, { headers: this.headers() });
  }
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${API_BASE.NOTIFICATION}/api/v1/notifications/${notificationId}`, { headers: this.headers() });
  }
  getNotificationsByType(userId: number, type: string): Observable<any> {
    return this.http.get(`${API_BASE.NOTIFICATION}/api/v1/notifications/type?userId=${userId}&type=${type}`, { headers: this.headers() });
  }

  // DISCUSSION
  createThread(thread: any): Observable<any> {
    return this.http.post(`${API_BASE.DISCUSSION}/api/v1/discussion/threads`, thread, { headers: this.headers() });
  }
  getThreadsByCourse(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/course/${courseId}`);
  }
  getThreadsByLesson(lessonId: number): Observable<any> {
    return this.http.get(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/lesson/${lessonId}`);
  }
  getThreadById(threadId: number): Observable<any> {
    return this.http.get(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/${threadId}`);
  }
  deleteThread(threadId: number): Observable<any> {
    return this.http.delete(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/${threadId}`, { headers: this.headers() });
  }
  pinThread(threadId: number): Observable<any> {
    return this.http.put(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/${threadId}/pin`, {}, { headers: this.headers() });
  }
  closeThread(threadId: number): Observable<any> {
    return this.http.put(`${API_BASE.DISCUSSION}/api/v1/discussion/threads/${threadId}/close`, {}, { headers: this.headers() });
  }
  postReply(reply: any): Observable<any> {
    return this.http.post(`${API_BASE.DISCUSSION}/api/v1/discussion/replies`, reply, { headers: this.headers() });
  }
  getRepliesByThread(threadId: number): Observable<any> {
    return this.http.get(`${API_BASE.DISCUSSION}/api/v1/discussion/replies/thread/${threadId}`);
  }
  upvoteReply(replyId: number, studentId: number): Observable<any> {
    return this.http.put(`${API_BASE.DISCUSSION}/api/v1/discussion/replies/${replyId}/upvote?studentId=${studentId}`, {}, { headers: this.headers() });
  }
  acceptReply(replyId: number): Observable<any> {
    return this.http.put(`${API_BASE.DISCUSSION}/api/v1/discussion/replies/${replyId}/accept`, {}, { headers: this.headers() });
  }
  deleteReply(replyId: number): Observable<any> {
    return this.http.delete(`${API_BASE.DISCUSSION}/api/v1/discussion/replies/${replyId}`, { headers: this.headers() });
  }

  // AUTH — PROFILE & USER MANAGEMENT
  getCurrentUser(): Observable<any> {
    return this.http.get(`${API_BASE.AUTH}/auth/me`, { headers: this.headers() });
  }
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${API_BASE.AUTH}/auth/user/${userId}`, { headers: this.headers() });
  }
  updateProfile(data: { userId: number; fullName: string; bio: string; mobile: string }): Observable<any> {
    return this.http.put(`${API_BASE.AUTH}/auth/profile`, data, { headers: this.headers() });
  }
  changePassword(data: { userId: number; oldPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${API_BASE.AUTH}/auth/change-password`, data, { headers: this.headers() });
  }
  getAllUsers(): Observable<any> {
    return this.http.get(`${API_BASE.AUTH}/auth/users`, { headers: this.headers() });
  }
  getUsersByRole(role: string): Observable<any> {
    return this.http.get(`${API_BASE.AUTH}/auth/users/role/${role}`, { headers: this.headers() });
  }
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${API_BASE.AUTH}/auth/users/${userId}`, { headers: this.headers() });
  }

  // COURSE REVIEWS
  getCourseReviews(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/${courseId}/reviews`);
  }
  submitCourseReview(courseId: number, data: { studentId: number; rating: number; comment: string }): Observable<any> {
    return this.http.post(`${API_BASE.COURSE}/api/v1/courses/${courseId}/reviews`, data, { headers: this.headers() });
  }
  getCourseRating(courseId: number): Observable<any> {
    return this.http.get(`${API_BASE.COURSE}/api/v1/courses/${courseId}/rating`);
  }
}
