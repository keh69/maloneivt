// 공지사항: data/notices.json 을 읽어 목록·상세·메인 미리보기를 그립니다.
// body 태그의 data-base 는 사이트 최상위까지의 상대 경로입니다. (예: "../../")
(() => {
  const base = document.body.dataset.base || "./";

  const fmtDate = (d) => String(d || "").replaceAll("-", ".");

  const load = async () => {
    const res = await fetch(base + "data/notices.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const sort = (list) =>
    [...list].sort((a, b) => {
      const pin = (b?.pinned ? 1 : 0) - (a?.pinned ? 1 : 0);
      if (pin) return pin;
      const d = String(b?.date || "").localeCompare(String(a?.date || ""));
      if (d) return d;
      return String(b?.id || "").localeCompare(String(a?.id || ""));
    });

  const renderList = (wrap, list, detailHref) => {
    wrap.textContent = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.className = "board__empty";
      li.textContent = "아직 올라온 공지가 없습니다.";
      wrap.appendChild(li);
      return;
    }
    list.forEach((n) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = detailHref + "?id=" + encodeURIComponent(n.id || "");

      const time = document.createElement("time");
      time.dateTime = n.date || "";
      time.textContent = fmtDate(n.date);

      const title = document.createElement("span");
      title.className = "board__title";
      title.textContent = n.title || "제목 없는 공지";

      a.append(time, title);
      if (n.pinned) {
        const pin = document.createElement("span");
        pin.className = "pin";
        pin.textContent = "고정";
        a.appendChild(pin);
      } else {
        a.appendChild(document.createElement("span"));
      }
      li.appendChild(a);
      wrap.appendChild(li);
    });
  };

  const renderError = (wrap) => {
    wrap.innerHTML = "";
    const li = document.createElement("li");
    li.className = "board__empty";
    li.textContent = "공지를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.";
    wrap.appendChild(li);
  };

  const renderDetail = (n) => {
    const titleEl = document.querySelector("[data-notice-title]");
    const metaEl = document.querySelector("[data-notice-meta]");
    const bodyEl = document.querySelector("[data-notice-content]");
    if (!titleEl || !metaEl || !bodyEl) return;

    if (!n) {
      titleEl.textContent = "공지를 찾을 수 없습니다";
      metaEl.textContent = "";
      bodyEl.textContent = "삭제되었거나 주소가 바뀐 공지입니다. 아래 목록으로 돌아가 다시 찾아 주세요.";
      return;
    }
    document.title = (n.title || "공지") + " | 말론투자";
    titleEl.textContent = n.title || "제목 없는 공지";
    metaEl.textContent = fmtDate(n.date) + " 게시" + (n.pinned ? " (상단 고정)" : "");
    const lines = Array.isArray(n.content) ? n.content : [String(n.content || "")];
    bodyEl.textContent = lines.join("\n");
  };

  const listWrap = document.querySelector("[data-notice-list]");
  const mode = document.body.dataset.noticeMode;

  load()
    .then((all) => {
      const sorted = sort(all);
      if (mode === "detail") {
        const id = new URL(location.href).searchParams.get("id");
        renderDetail(sorted.find((n) => String(n.id) === String(id)));
      }
      if (listWrap) {
        const limit = Number(listWrap.dataset.limit || 0);
        const href = listWrap.dataset.detail || "./detail.html";
        renderList(listWrap, limit ? sorted.slice(0, limit) : sorted, href);
      }
    })
    .catch(() => {
      if (listWrap) renderError(listWrap);
      if (mode === "detail") renderDetail(null);
    });
})();
