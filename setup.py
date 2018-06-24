#!/usr/bin/env python

from setuptools import setup

setup(name='django-web3-auth',
      version='0.1',
      description='A pluggable Django app that enables login/signup via an Ethereum wallet',
      url='https://github.com/Bearle/django-web3-auth',
      packages=['web3auth'],
      package_data={'web3auth': ['templates/web3auth/*.html',
                                 'static/web3auth/js/*.js']},
      install_requires=['Django>=2.0', 'ethereum>=2.3.1','rlp==0.6.0'],
     )
