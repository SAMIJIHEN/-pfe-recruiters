from django.urls import path
from . import views

urlpatterns = [
    path("profile/", views.profile_view, name="profile"),
    path("upload/<str:file_type>/", views.upload_file, name="upload_file"),
    path("parse-cv/", views.parse_cv, name="parse_cv"),
]