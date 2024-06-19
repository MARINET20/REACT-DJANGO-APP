from .views import *
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', ProjectDetailsView.as_view(), name='project-list'),
    path('project/<int:pk>', ProjectDetail.as_view(), name='project-detail'),    
    path('status', ProjectDetailsIsTrue.as_view(), name='project-status'),
    path('add/project', add_new_project, name='add-project'),
    path('add-other-project', add_other_project, name='add-project'),
    path('teachers', TeacherView.as_view(), name='teachers'),
    path('project/teachers', ProjectTeacherView, name='project-teachers'),
    path('skill', SkillView.as_view(), name='skill'),
    path('discipline', DisciplineView.as_view(), name='discipline'),
    path('add/discipline', DisciplineCreteView.as_view(), name='add-discipline'),
    path('add/skills', SkillCreteView.as_view(), name='add-skill'),
    path('add/grade', grade_crete_view, name='add-grade'),
    path('add/grade-file', grade_file_view, name='add-grade-file'),
    path('students', StudentDetailsView.as_view(), name='student'),
    path('search-team', search_team, name='formation-team'),
    path('filter/project', get_projects, name='filtered-projects'),
    path('filter/project/<int:pk>', get_project_id, name='filtered-projects'),
    path('filter/project/team', get_projects_a_team_formed, name='filtered-project-team'),
    path('filter/student/team', get_students_is_project, name='filtered-project-team'),
    path('get/student/<int:student_id>', get_student, name='get-student'),
    path('skill/weight', project_weight_view, name='weight-skills'),
    path('history', add_history_project, name='project-student'),

    path('add-team-db', add_team_db, name='add-team-db'),
    path('reset-password', reset_password, name='reset_password'),
    path('change-password', change_password, name='change_password'),
    path('user/<int:pk>', user_profile, name='user-profile'),
    path('add-applications', application_view, name='add-applications'),
    path('delete-applications', delete_applications_view, name='add-applications'),
    path('applications', SelectedProjectView.as_view(), name='applications'),
    path('project/tag', ProjectTagsView.as_view(), name='tag'),
    path('tags', TagDetailView.as_view(), name='all-tags'),
    path('edit/project', edit_project, name=''),

    path('upload-avatar', AvatarUploadView.as_view(), name='upload-avatar'),
    
    path('create/student', create_users),
    path('addUser', add_user, name=''),
    path('add-user-file', add_user_file, name=''),
    path('edit/user', edit_user, name=''),
    path('get-distinct-data', get_directions_from_db, name=''),
    path('get-courses-data', get_courses_from_db, name=''),
    path('get_count_from_db', get_count_from_db, name=''),

    path('get_info_from_db', get_info_from_db, name=''),
    path('upload-report', upload_docx_report, name='upload_docx_report'),
    path('add-skills-from-report', add_skills_from_report, name='add-skills-from-report'),
    
]
