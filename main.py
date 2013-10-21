import os
import webapp2
import jinja2
import re
import string
import hashlib
import hmac
import random
import json
import time

from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.api import mail

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir),
                               autoescape = True)

def render_str(template, **params):
  t = jinja_env.get_template(template)
  return t.render(params)

def make_secure_val(val):
  return '%s|%s' % (val, hmac.new(secret, val).hexdigest())

def check_secure_val(secure_val):
  val = secure_val.split('|')[0]
  if secure_val == make_secure_val(val):
    return val

    
# Regular Expression Tests
USER_RE = re.compile(r"^[a-zA-Z0-9_-]{3,20}$")
def valid_username(username):
  return username and USER_RE.match(username)

PASS_RE = re.compile(r"^.{3,20}$")
def valid_password(password):
  return password and PASS_RE.match(password)

EMAIL_RE  = re.compile(r'^[\S]+@[\S]+\.[\S]+$')
def valid_email(email):
  return not email or EMAIL_RE.match(email)

COOKIE_RE = re.compile(r'.+=;\s*Path=/')
def valid_cookie(cookie):
  return cookie and COOKIE_RE.match(cookie)

# Hash Maker
def make_salt():
  return ''.join(random.choice(string.letters) for x in xrange(5))

def make_pw_hash(name, pw, salt):
  if not salt:
    salt = make_salt()
  h = hashlib.sha256(name + pw + salt).hexdigest()
  return '%s|%s' %(salt, h)

def make_cookie_hash(c):
  h = hashlib.sha256(c).hexdigest()
  return '%s|%s' %(c, h)

def valid_pw(name, pw, h):
  salt = h.split('|')[0]
  return h == make_pw_hash(name, pw, salt)


# DB Models
class Post(db.Model):
    title = db.StringProperty(required = True)
    content = db.TextProperty();
    created = db.DateTimeProperty(auto_now_add = True)
    last_modified = db.DateTimeProperty(auto_now = True)
    public = db.BooleanProperty(required = True);

class User(db.Model):
    username = db.StringProperty(required = True)
    password = db.StringProperty(required = True)
    email_address = db.EmailProperty()
    created = db.DateTimeProperty(auto_now_add = True)

    @classmethod
    def by_id(cls, uid):
        return User.get_by_id(uid)

    @classmethod
    def by_name(cls, name):
        u = User.all().filter('username =', name).get()
        return u

    @classmethod
    def register(cls, name, pw, email):
        pw_hash = make_pw_hash(name, pw, salt = None)
        return User(username = name,
                    password = pw_hash,
                    email = email)

    @classmethod
    def login(cls, name, pw):
        u = cls.by_name(name)
        if u and valid_pw(name, pw, u.password):
            return u



# Request Controllers
class Handler(webapp2.RequestHandler):
  def write(self, *a, **kw):
    self.response.out.write(*a, **kw)

  def render_str(self, template, **params):
    return render_str(template, **params)
    
  def render(self, template, **kw):
    self.write(self.render_str(template, **kw))
    
  def set_secure_cookie(self, name, val):
    cookie_val = make_secure_val(val)
    self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, cookie_val))

  def read_secure_cookie(self, name):
    cookie_val = self.request.cookies.get(name)
    return cookie_val and check_secure_val(cookie_val)

  def login(self, user):
    self.set_secure_cookie('user_id', str(user.key().id()))

  def logout(self):
    self.response.headers.add_header('Set-Cookie', 'user_id=; Path=/')

  def initialize(self, *a, **kw):
    webapp2.RequestHandler.initialize(self, *a, **kw)
    uid = self.read_secure_cookie('user_id')
    self.user = uid and User.by_id(int(uid))
    self.format = 'html'

class About(Handler):
    def get(self):
        self.render("about.html")

class Resume(Handler):
    def get(self):
        self.render("resume.html")
    
class Goodreads(Handler):
    def get(self):
        self.render("goodreads.html")
    
class Portfolio(Handler):
    def get(self):
          self.render("portfolio.html")

class PortfolioDetail(Handler):
    def get(self, projectID):
      if projectID == '1001':
        self.render("dynamicHomePageDetail.html")
      elif projectID == '1002':
        self.render("applicationDetail.html")
      elif projectID == '1003':
        self.render("profileDetail.html")
      elif projectID == '1004':
        self.render("calendarCareerDetail.html")
      elif projectID == '1005':
        self.render("mobileDetail.html")
      elif projectID == '1006':
        self.render("ioumobileDetail.html")
      else:
        self.render("portfolio.html")

class TicTacToe(Handler):
    def get(self):
        self.render("tic-tac-toe.html")

class ContactMe(Handler):
    def get(self):
        self.render("contactForm.html")

    def post(self):
        have_error = False
        self.name = self.request.get('name')
        self.email = self.request.get('email')
        self.honeypot = self.request.get('comments2')
        self.comments = self.request.get('comments')

        params = dict(name = self.name,
                      email = self.email,
                      comments = self.comments)

        if not valid_email(self.email):
            params['error_email'] = "Please enter a valid email address."
            have_error = True

        if not self.name or not self.email or not self.comments:
            params['error'] = "All fields are required."
            have_error = True
        elif self.honeypot:
            params['error'] = "Your message has not been sent. Please try again later."
            have_error = True

        if have_error:
            self.render("contactForm.html", **params)
        else:
            message = mail.EmailMessage(sender = "Web Admin <mike@mikedanaher.me>",
                                    subject = "Website Contact from %s" % self.name,
                                    to = "Mike Danaher <danaher.mike@gmail.com>",
                                    reply_to = self.email,
                                    html = "<p>%s</p><p>From: %s<br>Email: %s</p>" % (self.comments.replace('\n','<br>'), self.name, self.email))
            message.send()
            self.render("contactThankYou.html")

class Signup(Handler):
    def get(self):
        self.render("signup-form.html")

    def post(self):
        have_error = False
        self.username = self.request.get('username')
        self.password = self.request.get('password')
        self.verify = self.request.get('verify')
        self.email = self.request.get('email')

        u = User.by_name(self.username)
        params = dict(username = self.username,
                      email = self.email)

        if u:
            params['error_username'] = "That user already exists."
            have_error = True
        elif not valid_username(self.username):
            params['error_username'] = "That's not a valid username."
            have_error = True

        if not valid_password(self.password):
            params['error_password'] = "That wasn't a valid password."
            have_error = True
        elif self.password != self.verify:
            params['error_verify'] = "Your passwords didn't match."
            have_error = True

        if not valid_email(self.email):
            params['error_email'] = "That's not a valid email."
            have_error = True

        if have_error:
            self.render('signup-form.html', **params)
        else:
            u = User.register(self.username, self.password, self.email)
            u.put()

            self.login(u)
            self.redirect('/')

class Login(Handler):
    def get(self):
        self.render('login-form.html')

    def post(self):
        username = self.request.get('username')
        password = self.request.get('password')

        u = User.login(username, password)
        if u:
            self.login(u)
            self.redirect('/')
        else:
            error = 'Invalid login'
            self.render('login-form.html', username = username, error_password = error)

class Logout(Handler):
    def get(self):
        self.logout()
        self.redirect('/')


app = webapp2.WSGIApplication([('/', About),
                               ('/resume', Resume),
                               ('/portfolio', Portfolio),
                               ('/portfolio/(\d+)', PortfolioDetail),
                               ('/goodreads', Goodreads),
                               ('/contact', ContactMe),
                               ('/tic-tac-toe', TicTacToe),
                               ('/login', Login),
                               ('/logout', Logout)],
                              debug=True)
