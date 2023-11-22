// ==UserScript==
// @name         YouTubePlus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds lots of controls & features to YouTube videos.
// @author       noEngineer
// @match        https://www.youtube.com/*
// @match        https://www.youtube-nocookie.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the frame-by-frame controls
    function addFrameByFrameControls() {
        // Get the YouTube video player
        const player = document.querySelector('.html5-main-video');

        if (!player) {
            console.error('YouTube video player not found.');
            return;
        }

        // Create the frame-by-frame controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.top = '10px';
        controlsContainer.style.left = '10px';
        controlsContainer.style.zIndex = '9999';

        // Create the "Previous Frame" button
        const prevFrameButton = document.createElement('button');
        prevFrameButton.textContent = '<<';
        prevFrameButton.addEventListener('click', () => {
            player.currentTime -= 1 / player.playbackRate;
        });

        // Create the "Next Frame" button
        const nextFrameButton = document.createElement('button');
        nextFrameButton.textContent = '>>';
        nextFrameButton.addEventListener('click', () => {
            player.currentTime += 1 / player.playbackRate;
        });

        // Append buttons to the controls container
        controlsContainer.appendChild(prevFrameButton);
        controlsContainer.appendChild(nextFrameButton);

        // Append the controls container to the video player parent
        player.parentElement.appendChild(controlsContainer);
    }

    // Add the frame-by-frame controls when the YouTube video player is ready
    const observer = new MutationObserver(() => {
        if (document.querySelector('.html5-main-video')) {
            observer.disconnect();
            addFrameByFrameControls();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
