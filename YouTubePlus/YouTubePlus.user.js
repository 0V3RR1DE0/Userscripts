// ==UserScript==
// @name         YouTubePlus
// @namespace    https://github.com/0V3RR1DE0/Userscripts/tree/main/YouTubePlus
// @version      0.0.1-alpha
// @description  Enhances YouTube with additional features.
// @author       0V3RR1DE0
// @match        https://www.youtube.com/*
// @grant        none
// @license      MIT
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
        controlsContainer.style.bottom = '40px'; // Adjust the bottom position as needed
        controlsContainer.style.left = '10px';
        controlsContainer.style.zIndex = '9999';

        // Create the "Previous Frame" button
        const prevFrameButton = document.createElement('button');
        prevFrameButton.textContent = '<<';
        prevFrameButton.addEventListener('click', () => {
            player.pause(); // Pause the video when navigating frames
            player.currentTime -= 0.1 / player.playbackRate;
        });

        // Create the "Next Frame" button
        const nextFrameButton = document.createElement('button');
        nextFrameButton.textContent = '>>';
        nextFrameButton.addEventListener('click', () => {
            player.pause(); // Pause the video when navigating frames
            player.currentTime += 0.05 / player.playbackRate;
        });

        // Append buttons to the controls container
        controlsContainer.appendChild(prevFrameButton);
        controlsContainer.appendChild(nextFrameButton);

        // Append the controls container to the "ytp-left-controls" div
        const leftControlsDiv = document.querySelector('.ytp-left-controls');
        if (leftControlsDiv) {
            leftControlsDiv.appendChild(controlsContainer);
        } else {
            console.error('ytp-left-controls div not found.');
        }
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
