document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector("#event-gallery");
    const filterButtons = [...document.querySelectorAll(".gallery-filter__button")];
    const allItems = [...document.querySelectorAll(".gallery-item")];
    const visibleCount = document.querySelector("#gallery-visible-count");
    const lightbox = document.querySelector("#gallery-lightbox");
    const mediaFrame = document.querySelector("#gallery-lightbox-media");
    const count = document.querySelector("#gallery-lightbox-count");
    const closeButton = lightbox?.querySelector(".gallery-lightbox__close");
    const previousButton = lightbox?.querySelector(".gallery-lightbox__prev");
    const nextButton = lightbox?.querySelector(".gallery-lightbox__next");

    if (!gallery || !lightbox || !mediaFrame) return;

    let currentIndex = 0;
    let lastTrigger = null;
    const getVisibleItems = () => allItems.filter(item => !item.hidden);

    const updateFilter = filter => {
        filterButtons.forEach(button => {
            const isActive = button.dataset.filter === filter;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
        allItems.forEach(item => {
            item.hidden = filter !== "all" && item.dataset.type !== filter;
        });
        if (visibleCount) visibleCount.textContent = String(getVisibleItems().length);
    };

    const stopCurrentVideo = () => {
        const video = mediaFrame.querySelector("video");
        if (!video) return;
        video.pause();
        video.removeAttribute("src");
        video.load();
    };

    const renderItem = index => {
        const items = getVisibleItems();
        if (!items.length) return;
        currentIndex = (index + items.length) % items.length;
        const item = items[currentIndex];
        const isVideo = item.dataset.type === "video";
        stopCurrentVideo();
        mediaFrame.replaceChildren();

        if (isVideo) {
            const video = document.createElement("video");
            video.controls = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.src = item.dataset.src;
            if (item.dataset.poster) video.poster = item.dataset.poster;
            video.setAttribute("aria-label", `Gallery film ${currentIndex + 1}`);
            mediaFrame.append(video);
            video.play().catch(() => {});
        } else {
            const image = document.createElement("img");
            image.src = item.dataset.src;
            image.alt = item.querySelector("img")?.alt || item.dataset.title || "Gallery photograph";
            image.decoding = "async";
            mediaFrame.append(image);
        }

        count.textContent = `${currentIndex + 1} / ${items.length} · ${isVideo ? "Film" : "Photograph"}`;
    };

    const openItem = item => {
        currentIndex = getVisibleItems().indexOf(item);
        lastTrigger = item;
        renderItem(currentIndex);
        lightbox.showModal();
        document.body.classList.add("gallery-is-open");
        closeButton?.focus();
    };

    filterButtons.forEach(button => button.addEventListener("click", () => updateFilter(button.dataset.filter || "all")));
    gallery.addEventListener("click", event => {
        const item = event.target.closest(".gallery-item");
        if (item && !item.hidden) openItem(item);
    });
    closeButton?.addEventListener("click", () => lightbox.close());
    previousButton?.addEventListener("click", () => renderItem(currentIndex - 1));
    nextButton?.addEventListener("click", () => renderItem(currentIndex + 1));
    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", () => {
        stopCurrentVideo();
        mediaFrame.replaceChildren();
        document.body.classList.remove("gallery-is-open");
        lastTrigger?.focus();
    });
    lightbox.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            renderItem(currentIndex - 1);
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            renderItem(currentIndex + 1);
        }
    });
    updateFilter("all");
});
