// 말론투자 공통 스크립트: 현재 메뉴 표시, 모바일 메뉴, 연도, 상담 신청 폼
(() => {
  const section = document.body.dataset.section;
  if (section) {
    document.querySelectorAll(`[data-nav="${section}"]`).forEach((a) => a.classList.add("is-here"));
  }

  const norm = (p) => p.replace(/index\.html$/, "");
  const here = norm(location.pathname);
  document.querySelectorAll(".tabs a").forEach((a) => {
    if (norm(new URL(a.href, location.href).pathname) === here) a.setAttribute("aria-current", "page");
  });

  const top = document.querySelector(".top");
  const toggle = document.querySelector(".menu-toggle");
  if (top && toggle) {
    toggle.addEventListener("click", () => {
      const open = top.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector("span").textContent = open ? "닫기" : "메뉴";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && top.classList.contains("is-open")) {
        top.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector("span").textContent = "메뉴";
        toggle.focus();
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // 상담 신청 폼: 접수 서버를 연결하기 전까지는 입력만 확인하고 전화 안내를 띄웁니다.
  const form = document.getElementById("applyForm");
  if (form) {
    const status = form.querySelector(".form__status");
    const setError = (input, msg) => {
      const box = document.getElementById(input.id + "-error");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (box) box.textContent = msg || "";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const phone = form.elements.phone;
      const agree = form.elements.agree;
      let ok = true;

      setError(name, name.value.trim() ? "" : "이름을 입력해 주세요.");
      if (!name.value.trim()) ok = false;

      const digits = phone.value.replace(/\D/g, "");
      const phoneMsg = digits.length >= 10 ? "" : "연락받을 휴대전화번호를 숫자 10~11자리로 입력해 주세요.";
      setError(phone, phoneMsg);
      if (phoneMsg) ok = false;

      if (!agree.checked) ok = false;

      status.classList.toggle("is-error", !ok);
      if (!ok) {
        status.textContent = agree.checked
          ? "표시된 항목을 확인해 주세요."
          : "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";
        return;
      }
      status.textContent = "온라인 접수는 준비 중입니다. 고객센터(0000-0000-0000)로 전화 주시면 바로 안내해 드립니다.";
    });
  }
})();
