// ==UserScript==
// @name         MusicButler Deezer
// @namespace    http://tampermonkey.net/
// @version      2024-06-01
// @description  Adds Deezer functionality. At the moment only quick search for song.
// @author       Bababoiiiii
// @match        https://www.musicbutler.io/
// @match        https://www.musicbutler.io/users/profile/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=musicbutler.io
// @grant        none
// ==/UserScript==


function main() {
    function process_elem(elem, in_app) {
        let artist = elem.querySelector("div > div.grow.mt-2 > div.flex.flex-col.w-full.justify-between.grow > div.justify-self-end.grow > div.flex.flex-row.text-xs.px-4.group-data-\\[xs-cols\\=\\'2\\'\\]\\:px-2.mt-2.items-end.text-skin-card-info > div > div > span > a > span").textContent;
        let song = elem.querySelector("div > div.grow.mt-2 > div.flex.flex-col.w-full.justify-between.grow > div.text-sm.font-bold.mt-4.group-data-\\[xs-cols\\=\\'2\\'\\]\\:mt-2.px-4.h-10.group-data-\\[xs-cols\\=\\'2\\'\\]\\:px-2.flex.justify-center.flex-col.my-2 > p").textContent;
        let link = `${in_app ? "deezer" : "https"}://www.deezer.com/search/${song} - ${artist}`

        let a = document.createElement("a");
        a.innerHTML = `<a class="block" href="${link}" target="_blank"> <div class="py-2 text-center text"> <i class="fab fa-fw fa-deezer" aria-label="Deezer Link for the release ${song}" style="color: rgb(162, 56, 255);"></i> </div> </a>`
        elem.querySelector("div > div.grow.mt-2 > div.flex.flex-col.w-full.justify-between.grow > div.justify-self-end.grow > div.flex.flex-row.justify-between.items-center.w-full.mt-2.px-\\[0\\.85rem\\].group-data-\\[xs-cols\\=\\'2\\'\\]\\:px-2").prepend(a);
    }



    function wait_and_process_new_elems(i) {
        const wait = setInterval(() => {
            let song_elem = document.querySelector(`#feed-releases-group > div:nth-child(${i})`);
            console.log("[Deezer] Waiting for more songs...");
            if (song_elem !== null && song_elem.getAttribute("hx-swap") === null) {
                clearInterval(wait);

                console.log("[Deezer] Processing more songs...");
                process_elem(song_elem, in_app);

                while (true) {
                    i++;
                    song_elem = document.querySelector(`#feed-releases-group > div:nth-child(${i})`);

                    if (song_elem?.getAttribute("hx-swap") === "outerHTML") { // elements have loaded in, but there are still more elements
                        wait_and_process_new_elems(i);

                    }
                    else if (song_elem !== null) { // this is a song element, process it
                        process_elem(song_elem, in_app);

                    }
                    else { // there are no new songs, bottom of page reached, this run is finished. if there are still songs to be listed, the above statements take care of that
                        console.log("[Deezer] Processed all songs, ending this run...");
                        break;
                    }
                }
            }
        }, 500)
        }

    let in_app = window.localStorage.getItem("open_deezer_in_app");
    in_app = in_app === "true";

    wait_and_process_new_elems(1);
}

function settings() {
    let state = window.localStorage.getItem("open_deezer_in_app");
    state = state === "true";

    const inactiveHTML = `<div tabindex="0" class="p-4 rounded-lg flex-col cursor-pointer ring-1 ring-gray-300 bg-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 hover:outline-none hover:ring-1 hover:ring-green-400"> <div class="flex flex-row items-center justify-between"> <label for="convert_deezer_links"> <span class="font-semibold"> Open Deezer links in app </span> </label> <span class="w-2 h-2 rounded-full inline-block bg-gray-400 "></span> <input type="checkbox" name="convert_deezer_links" class="hidden" id="id_convert_deezer_links"> </div> <div class="mt-4 text-sm font-medium text-gray-400 "> <em>Deezer links will not work if you enable this but don't have Deezer's app</em>. Only check this option if you have the Deezer app installed and want links to open there instead of the web-browser. </div> </div>`;
    const activeHTML = `<div _="on click toggle @checked on the first <input/> in me then send doSubmit to closest <form/>" tabindex="0" class="p-4 rounded-lg flex-col cursor-pointer bg-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 hover:outline-none hover:ring-1 hover:ring-green-400"> <div class="flex flex-row items-center justify-between"> <label for="convert_deezer_links"> <span class="font-semibold"> Open Deezer links in app </span> </label> <span class="w-2 h-2 rounded-full inline-block bg-green-400 "></span> <input type="checkbox" name="convert_deezer_links" class="hidden" id="id_convert_deezer_links" checked=""> </div> <div class="mt-4 text-sm font-medium text-gray-200 "> <em>Deezer links will not work if you enable this but don't have Deezer's app</em>. Only check this option if you have the Deezer app installed and want links to open there instead of the web-browser. </div> </div>`;

    let e = document.createElement("div");
    e.innerHTML = state ? activeHTML : inactiveHTML;

    e.onclick = () => {
        state = !state
        window.localStorage.setItem("open_deezer_in_app", state);
        e.innerHTML = state ? activeHTML : inactiveHTML;
    }

    document.querySelector("#content > div > div > div:nth-child(16) > form > div").appendChild(e);

}


(function() {
    if (location.href === "https://www.musicbutler.io/") {
        main();
    }
    else if (location.href === "https://www.musicbutler.io/users/profile/") {
        window.addEventListener('DOMContentLoaded', settings);
        settings();
    }
})();
