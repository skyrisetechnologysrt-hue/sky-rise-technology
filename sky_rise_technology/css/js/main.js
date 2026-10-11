(function () {
  'use strict';

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Quick website check (runs in the browser; checks the address only)
  var checkForm = document.getElementById('checkForm');
  var input = document.getElementById('siteUrl');
  var errorEl = document.getElementById('checkError');
  var resultsEl = document.getElementById('results');
  var auditBtn = document.getElementById('auditBtn');

  function addResult(type, tag, text) {
    var li = document.createElement('li');
    li.className = type;
    var t = document.createElement('span');
    t.className = 'tag';
    t.textContent = tag;
    var s = document.createElement('span');
    s.textContent = text;
    li.appendChild(t);
    li.appendChild(s);
    resultsEl.appendChild(li);
  }

  function parseUrl(raw) {
    var value = raw.trim();
    if (!value) return null;
    var hadScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
    try {
      var url = new URL(hadScheme ? value : 'http://' + value);
      if (!/^https?:$/.test(url.protocol)) return null;
      if (!/^[a-z0-9.-]+$/i.test(url.hostname) || (url.hostname.indexOf('.') === -1 && url.hostname !== 'localhost')) return null;
      return { url: url, hadScheme: hadScheme };
    } catch (err) { return null; }
  }

  checkForm.addEventListener('submit', function (e) {
    e.preventDefault();
    resultsEl.innerHTML = '';
    errorEl.hidden = true;
    auditBtn.hidden = true;

    var parsed = parseUrl(input.value);
    if (!parsed) {
      errorEl.textContent = 'Enter a valid website address, for example example.com';
      errorEl.hidden = false;
      return;
    }

    var url = parsed.url;
    var host = url.hostname;

    addResult('pass', 'Valid', 'Address looks correct: ' + host);

    if (!parsed.hadScheme) {
      addResult('note', 'Note', 'No https:// given. Make sure your site loads securely on https.');
    } else if (url.protocol === 'https:') {
      addResult('pass', 'HTTPS', 'Address uses https, which encrypts visitor traffic.');
    } else {
      addResult('fail', 'HTTP', 'Address uses plain http. Visitors\' data is not encrypted.');
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      addResult('fail', 'IP', 'Sites on a bare IP address cannot use a normal SSL certificate.');
    }
    if (url.port && url.port !== '80' && url.port !== '443') {
      addResult('note', 'Port', 'Non-standard port ' + url.port + ' is open to the public. We would review it.');
    }

    addResult('note', 'Next', 'A full audit also tests headers, forms, logins, outdated software and known bugs.');

    // Pre-fill the contact form
    document.getElementById('service').value = 'Security and bug check';
    document.getElementById('message').value = 'Please run a security check on ' + host + '.';
    auditBtn.hidden = false;
  });

  // Contact form: validate, then open the visitor's email app
  var form = document.getElementById('contactForm');
  var formError = document.getElementById('formError');
  var formOk = document.getElementById('formOk');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formError.hidden = true;
    formOk.hidden = true;

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var service = form.service.value;
    var message = form.message.value.trim();

    if (!name || !email || !message) {
      formError.textContent = 'Please fill in your name, email and message.';
      formError.hidden = false;
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formError.textContent = 'Enter a valid email address, for example name@example.com';
      formError.hidden = false;
      return;
    }

    var subject = encodeURIComponent('Enquiry: ' + service);
    var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nService: ' + service + '\n\n' + message);
    window.location.href = 'mailto:hello@skyrisetechnology.com?subject=' + subject + '&body=' + body;
    formOk.hidden = false;
    form.reset();
  });
})();