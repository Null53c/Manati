from django.conf.urls import include,url
from user_profiles import forms

urlpatterns = [
    url(r'^(?P<username>[\.\w-]+)/edit/$', 'userena.views.profile_edit',
        {'edit_profile_form': forms.EditProfileFormExtra}, name='edit-profile'),
    url(r'^', include('userena.urls')),
]