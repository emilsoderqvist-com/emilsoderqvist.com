const scrollers = document.querySelectorAll(".scroller");

if (!window.matchMedia("(prefers-reduced-motions: reduce)").matches) {
    AddAnimation();
}

function AddAnimation() {
    scrollers.forEach(scroller => {
        scroller.setAttribute("data-animated", true);

            const scrollerInner = scroller.querySelector(".scroller-inner");
            const scrollerContent = Array.from(scrollerInner.children);

            scrollerContent.forEach(item => {
                const duplicate = item.cloneNode();
                duplicate.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicate);
            });
    });
}