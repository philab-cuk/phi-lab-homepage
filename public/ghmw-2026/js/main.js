/* ===== Language Toggle ===== */
(function () {
  const LANG_KEY = 'ghmw-lang';

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'ko';
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  function applyLang(lang) {
    // Update all elements with data-ko / data-en
    document.querySelectorAll('[data-ko][data-en]').forEach(function (el) {
      el.innerHTML = lang === 'ko' ? el.getAttribute('data-ko') : el.getAttribute('data-en');
    });

    // Update placeholders
    document.querySelectorAll('[data-placeholder-ko][data-placeholder-en]').forEach(function (el) {
      el.placeholder = lang === 'ko'
        ? el.getAttribute('data-placeholder-ko')
        : el.getAttribute('data-placeholder-en');
    });

    // Update toggle button text
    var toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) {
      toggleBtn.textContent = lang === 'ko' ? 'EN' : 'KR';
    }

    // Update html lang attribute
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
  }

  // Init
  var currentLang = getLang();
  applyLang(currentLang);

  var toggleBtn = document.getElementById('langToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      currentLang = currentLang === 'ko' ? 'en' : 'ko';
      setLang(currentLang);
      applyLang(currentLang);
    });
  }

  /* ===== Mobile Menu ===== */
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var nav = document.querySelector('.nav');
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    // Close menu on link click
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }

  /* ===== Day 2 Notice Toggle ===== */
  var day2Checkbox = document.getElementById('day2Checkbox');
  var day2Notice = document.getElementById('day2Notice');
  if (day2Checkbox && day2Notice) {
    day2Checkbox.addEventListener('change', function () {
      day2Notice.style.display = this.checked ? 'block' : 'none';
    });
  }

  /* ===== Registration Form (CUK) ===== */
  var form = document.getElementById('registrationForm');
  if (form) {
    var submitBtn = document.getElementById('submitBtn');
    var successMessage = document.getElementById('successMessage');

    function showError(id, msgKo, msgEn) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = getLang() === 'ko' ? msgKo : msgEn;
      }
    }

    function clearErrors() {
      form.querySelectorAll('.form-error').forEach(function (el) {
        el.textContent = '';
      });
      form.querySelectorAll('.form-input.error').forEach(function (el) {
        el.classList.remove('error');
      });
    }

    function validateForm() {
      clearErrors();
      var valid = true;
      var lang = getLang();

      var name = form.querySelector('#name');
      if (!name.value.trim()) {
        name.classList.add('error');
        showError('nameError', '이름을 입력해주세요.', 'Please enter your name.');
        valid = false;
      }

      var email = form.querySelector('#email');
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        email.classList.add('error');
        showError('emailError', '이메일을 입력해주세요.', 'Please enter your email.');
        valid = false;
      } else if (!emailRegex.test(email.value.trim())) {
        email.classList.add('error');
        showError('emailError', '올바른 이메일 주소를 입력해주세요.', 'Please enter a valid email address.');
        valid = false;
      }

      var phone = form.querySelector('#phone');
      var phoneRegex = /^[\d\-+() ]{9,}$/;
      if (!phone.value.trim()) {
        phone.classList.add('error');
        showError('phoneError', '핸드폰번호를 입력해주세요.', 'Please enter your phone number.');
        valid = false;
      } else if (!phoneRegex.test(phone.value.trim())) {
        phone.classList.add('error');
        showError('phoneError', '올바른 전화번호를 입력해주세요.', 'Please enter a valid phone number.');
        valid = false;
      }

      var affiliation = form.querySelector('#affiliation');
      if (!affiliation.value.trim()) {
        affiliation.classList.add('error');
        showError('affiliationError', '소속기관/학과를 입력해주세요.', 'Please enter your affiliation.');
        valid = false;
      }

      var studentStatus = form.querySelector('#studentStatus');
      if (!studentStatus.value) {
        studentStatus.classList.add('error');
        showError('studentStatusError', '구분을 선택해주세요.', 'Please select your status.');
        valid = false;
      }

      var day1 = form.querySelector('[name="day1"]').checked;
      var day2 = form.querySelector('[name="day2"]').checked;
      var day3 = form.querySelector('[name="day3"]').checked;
      if (!day1 && !day2 && !day3) {
        showError('daysError', '참여 희망 일자를 최소 1개 선택해주세요.', 'Please select at least one day.');
        valid = false;
      }

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      var data = {
        name: form.querySelector('#name').value.trim(),
        email: form.querySelector('#email').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        affiliation: form.querySelector('#affiliation').value.trim(),
        student_status: form.querySelector('#studentStatus').value,
        day1: form.querySelector('[name="day1"]').checked,
        day2: form.querySelector('[name="day2"]').checked,
        day3: form.querySelector('[name="day3"]').checked,
      };

      // Loading state
      submitBtn.disabled = true;
      var originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<span class="spinner"></span>' +
        (getLang() === 'ko' ? '등록 중...' : 'Submitting...');

      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (result.success) {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            // Re-apply language to newly visible elements
            applyLang(getLang());
          } else {
            var lang = getLang();
            alert(lang === 'ko' ? result.message : (result.message || 'Registration failed. Please try again.'));
          }
        })
        .catch(function () {
          var lang = getLang();
          alert(lang === 'ko'
            ? '서버 연결에 실패했습니다. 다시 시도해주세요.'
            : 'Failed to connect to server. Please try again.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  /* ===== Conference Registration Form ===== */
  var confForm = document.getElementById('confRegistrationForm');
  if (confForm) {

  var confSubmitBtn = document.getElementById('confSubmitBtn');
  var confSuccessMessage = document.getElementById('confSuccessMessage');

  function showConfError(id, msgKo, msgEn) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = getLang() === 'ko' ? msgKo : msgEn;
    }
  }

  function clearConfErrors() {
    confForm.querySelectorAll('.form-error').forEach(function (el) {
      el.textContent = '';
    });
    confForm.querySelectorAll('.form-input.error').forEach(function (el) {
      el.classList.remove('error');
    });
  }

  function validateConfForm() {
    clearConfErrors();
    var valid = true;

    var name = confForm.querySelector('#confName');
    if (!name.value.trim()) {
      name.classList.add('error');
      showConfError('confNameError', '이름을 입력해주세요.', 'Please enter your name.');
      valid = false;
    }

    var email = confForm.querySelector('#confEmail');
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      email.classList.add('error');
      showConfError('confEmailError', '이메일을 입력해주세요.', 'Please enter your email.');
      valid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      email.classList.add('error');
      showConfError('confEmailError', '올바른 이메일 주소를 입력해주세요.', 'Please enter a valid email address.');
      valid = false;
    }

    var phone = confForm.querySelector('#confPhone');
    if (phone.value.trim()) {
      var phoneRegex = /^[\d\-+() ]{9,}$/;
      if (!phoneRegex.test(phone.value.trim())) {
        phone.classList.add('error');
        showConfError('confPhoneError', '올바른 전화번호를 입력해주세요.', 'Please enter a valid phone number.');
        valid = false;
      }
    }

    var affiliation = confForm.querySelector('#confAffiliation');
    if (!affiliation.value.trim()) {
      affiliation.classList.add('error');
      showConfError('confAffiliationError', '소속기관을 입력해주세요.', 'Please enter your affiliation.');
      valid = false;
    }

    var attendType = confForm.querySelector('input[name="attend_type"]:checked');
    if (!attendType) {
      showConfError('confAttendError', '참여 방식을 선택해주세요.', 'Please select attendance type.');
      valid = false;
    }

    return valid;
  }

  confForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateConfForm()) return;

    var data = {
      name: confForm.querySelector('#confName').value.trim(),
      email: confForm.querySelector('#confEmail').value.trim(),
      phone: confForm.querySelector('#confPhone').value.trim(),
      affiliation: confForm.querySelector('#confAffiliation').value.trim(),
      attend_type: confForm.querySelector('input[name="attend_type"]:checked').value,
    };

    confSubmitBtn.disabled = true;
    var originalText = confSubmitBtn.textContent;
    confSubmitBtn.innerHTML = '<span class="spinner"></span>' +
      (getLang() === 'ko' ? '등록 중...' : 'Submitting...');

    fetch('/api/register-conf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.success) {
          confForm.style.display = 'none';
          confSuccessMessage.style.display = 'block';
          applyLang(getLang());
        } else {
          var lang = getLang();
          alert(lang === 'ko' ? result.message : (result.message || 'Registration failed.'));
        }
      })
      .catch(function () {
        var lang = getLang();
        alert(lang === 'ko'
          ? '서버 연결에 실패했습니다. 다시 시도해주세요.'
          : 'Failed to connect to server. Please try again.');
      })
      .finally(function () {
        confSubmitBtn.disabled = false;
        confSubmitBtn.textContent = originalText;
      });
    });
  }
})();
