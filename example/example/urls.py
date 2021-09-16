"""example URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import logout

from django.shortcuts import render, redirect


def login(request):
    return render(request, 'web3auth/login.html')


def logout_view(request):
    logout(request)
    return redirect('login')


def user_view(request):
    return render(request, 'web3auth/user.html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', login, name='login'),
    path('user/', user_view, name='user'),
    path('', include('web3auth.urls', namespace='web3auth')),
    path('logout/', logout_view, name='logout'),
]
