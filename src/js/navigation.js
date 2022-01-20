//adapted from https://github.com/plumvillage/plumvillage/blob/master/modules/components/navigation/index.js
document.addEventListener('DOMContentLoaded', function() {
    const bodyElement = document.querySelector('body');

    // mega menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', e => {
        document.querySelector('.menu-toggle').classList.toggle('is-active');
        bodyElement.classList.toggle('menu-open');
        bodyElement.classList.add('menu-transitioning');
        document.querySelector('.mega-menu-container').classList.remove('hidden');
        // document.querySelector('.menu-open #menu-mega-menu > li:first-child > a').focus();
        e.preventDefault();
        e.stopPropagation();
    })
    document.querySelector('.site').addEventListener('click', e => {
        if (bodyElement.classList.contains('menu-open')) {
            document.querySelector('.menu-toggle').click();
            e.preventDefault();
            e.stopPropagation();
        }
    })

    // hide menu when not needed, prevents glitches/showing it when loading and scrolling
    document.querySelector('.site').addEventListener("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function() {
        if (!bodyElement.classList.contains('menu-open')) {
            document.querySelector('.mega-menu-container').classList.add('hidden');
            bodyElement.classList.remove('menu-transitioning');
        }
    })
}, false);