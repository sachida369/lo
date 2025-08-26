(function(){
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMsg = document.getElementById('formMsg');
  const CONFIG = window.CONFIG || { FORM_ENDPOINT: '' , CONTACT_EMAIL: 'brainimmensitynetwork@gmail.com' };

  function serialize(form){
    const obj = {};
    new FormData(form).forEach((v,k)=> obj[k]=v);
    return obj;
  }

  function fallbackMailto(data){
    // Prepopulate an email via mailto as fallback
    const subject = encodeURIComponent('New lead from website');
    const body = encodeURIComponent(Object.entries(data).map(([k,v])=>k+': '+v).join('\n'));
    const mailto = 'mailto:' + (CONFIG.CONTACT_EMAIL || 'brainimmensitynetwork@gmail.com') + '?subject=' + subject + '&body=' + body;
    window.location.href = mailto;
  }

  async function postToEndpoint(data){
    const endpoint = CONFIG.FORM_ENDPOINT || '';
    if(!endpoint){
      // no endpoint configured
      fallbackMailto(data);
      return;
    }
    try {
      submitBtn.disabled = true;
      formMsg.textContent = 'Sending...';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if(res.ok){
        formMsg.textContent = 'Thanks! We will contact you shortly.';
        form.reset();
      } else {
        const txt = await res.text();
        formMsg.textContent = 'Error: ' + (txt || res.statusText);
      }
    } catch (err){
      formMsg.textContent = 'Network error — using email fallback.';
      fallbackMailto(data);
    } finally {
      submitBtn.disabled = false;
    }
  }

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const data = serialize(form);
      // validation: mobile 10 digits
      if(!/^\d{10}$/.test(data.mobile || '')){
        formMsg.textContent = 'Enter valid 10 digit mobile number.';
        return;
      }
      if(!data.consent){
        formMsg.textContent = 'Please accept privacy policy.';
        return;
      }
      postToEndpoint(data);
    });
  }

  // Contact form on contact.html
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const fd = new FormData(contactForm);
      const obj = {};
      fd.forEach((v,k)=>obj[k]=v);
      // fallback to mailto for contact messages
      const subject = encodeURIComponent('Contact form message from website');
      const body = encodeURIComponent(Object.entries(obj).map(([k,v])=>k+': '+v).join('\n'));
      window.location.href = 'mailto:' + (CONFIG.CONTACT_EMAIL || 'brainimmensitynetwork@gmail.com') + '?subject=' + subject + '&body=' + body;
    });
  }
})();