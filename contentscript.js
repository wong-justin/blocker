/*
when new content loads, 

check for images (tags once page loaded, background, mutationObserver)

analyze to make sure they wont trigger a seizure (eg rapid changes in pixels per frame)

replace with safe filler image.


This does not detect css bacgkround images, animated css, videos, gifvs, webms, or any of that. 
Only html img tags. And not srcset attributes, only those with src attr that has ".gif" in it.
*/

let getGifs = () => {
    // method 1
//    return Array.from(
//        document.querySelectorAll('img[src$=".gif"]'));
    
    // method 2
//    let gifRegex = RegExp('.*(.gif).*');
//    return Array.from(document.images)
//        .filter(img => gifRegex.test(img.src));
    
    // method 3
    return Array.from(document.images)
        .filter(img => img.src.includes('.gif'));
}

/**
 * CORS creates problems with foreign images 
 * (eg corrupts canvas when drawn so can't get image data), 
 * so download foreign image and make local blob url.
 * 
 * @param  {String} url src of an image (not a local image)
 * @return {Image}  local image with src attr being cors-safe local blob url
 */
let localizedImage = async (imgUrl) => {
    return fetch(imgUrl).then(response => response.blob())
    .then(imgBlob => {
        return new Promise((resolve, reject) => {
            let image = new Image();        
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = URL.createObjectURL(imgBlob); 
        });
    });
}

/**
 *
 * @param  {Image}   An image element with width, height, and a gif src, .
 * @return {Boolean} Is gif safe for epileptic viewers
 */
let isGifSafe = async (gif) => {
    
    // seems as if localized gif not needed...
//    localizedImage(gif.src)
//    .then(localGif => {

    let superGif = new SuperGif({gif: gif});
    superGif.load(() => {

//        console.log('super gif has loaded');
        let gifCanvas = superGif.get_canvas();
        let gifCtx = gifCanvas.getContext('2d');
        let w = gifCanvas.width;
        let h = gifCanvas.height;

        let frameNum = 0;
        let numFrames = superGif.get_length();

        if (numFrames <= 1) {
            return true;
        }

        while (frameNum < numFrames) {

            superGif.move_to(frameNum);
//            console.log('on frame ' + (frameNum+1)+ ' of ' + numFrames);

            // display for testing
//            let dummyCanvas = document.createElement('canvas');
//            document.body.appendChild(dummyCanvas);
//            dummyCanvas.width = w;
//            dummyCanvas.height = h;
//            let ctx = dummyCanvas.getContext('2d');
//            ctx.drawImage(gifCanvas, 0, 0);


            // do work with pixels of this frame ...
            let frameData = gifCtx.getImageData(0, 0, w, h);
//            console.log(frameData);





            frameNum += 1;
        }
    });
    
    // test delay to simulate analysis lag time
    console.log('start fake analysis');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('end fake analysis');
//            let fakeResult = Date.now() % 2 == 0 ? 
//                             true :
//                             false;
            let fakeResult = false;
            resolve(fakeResult)
        }, 3000);
    });
}

/**
 * Pops original img src and replaces with safe transparent blank image.
 *
 *
 */
let replaceGif = (gif) => {
    let originalSrc = gif.src;
    //'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D'; // no color table is inconsistent transparent
    
    let safeReplacement = 'data:image/gif;base64,R0lGODlhAQABAIABAP8AAIKFjywAAAAAAQABAAACAkQBADs%3D'  // red pixel
    //'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';     // truly transparent
    gif.src = safeReplacement;
    return originalSrc;
}

/**
 * Restore original img src url.
 * Page will now redownload it from that host.
 *
 */
let restoreGif = (gif, originalUrl) => {
    gif.src = originalUrl;
}

let handleNewGif = async (gif) => {
    console.log('safety replacement while analyzing new gif');

    let src = replaceGif(gif);

    let gif2 = new Image();
    gif2.src = src;
    gif2.width = gif.width;
    gif2.height = gif2.height;

    let isSafe = await isGifSafe(gif2);
        
    if (isSafe) {
        console.log('gif is safe; restoring');
        restoreGif(gif, src);
    }
    else {
        console.log('gif NOT safe; keeping blank');
    }
    return isSafe;
}

let checkGifsOnPage = () => {
    
    getGifs()
    .map(async (gif) => {
        let src = gif.src;
        if (alreadyTrackedUrls.hasOwnProperty(src)) {
            let isKnownSafe = alreadyTrackedUrls[src];
            if (!isKnownSafe) {
//                console.log('recognized previously unsafe gif; replacing');
                replaceGif(gif);
            }
        }
        else {
            let wasSafe = await handleNewGif(gif);
            alreadyTrackedUrls[src] = wasSafe;
        }
    });
}

/* Keep track of urls that have already been checked.*/
let alreadyTrackedUrls = {};

/* check for gifs frequently as soon as page starts loading.
Checks often (safer for purpose of users) but consequently slower page.
I blame the lack of good observer functions in js.*/
let checkingInterval = setInterval(() => {
//    console.log('checking for new gifs');
    checkGifsOnPage();
}, 50);




////////////////////
// old methods below

/* clear thorough interval, to be replaced by
now only checking for gifs when body changes.  

sad - doesn't work if list of direct children of body remains same.
fix - recursive subtree of child elements, but seems even worse performance than frequent polling*/
//window.onload = () => {
//    clearInterval(checkingInterval);
//    
//    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
//    let observer = new MutationObserver((mutations, observer) => {
//        // called when a mutation occurs
//        console.log('mutation; checking for new gifs');
//        console.log(mutations, observer);
//
//        // check if images changed
//        getNewGifsAndFix();
//
//        // if possible to ever stop observing:
//        //observer.disconnect();
//    });
//    observer.observe(document.body, {childList: true});
//}



//let dummyCanvas = document.createElement('canvas');
//let ctx = dummyCanvas.getContext('2d');
//document.body.appendChild(dummyCanvas);
//
///* reuses global canvas/context to draw image and get pixeldata */
//let getImageData = (image) => {
//
////    let dummyCanvas = document.createElement('canvas');
////    let ctx = dummyCanvas.getContext('2d');
////    document.body.appendChild(dummyCanvas);
//
//    ctx.canvas.width = image.width;
//    ctx.canvas.height = image.height;
//    //ctx.clearRect(0, 0, image.width, image.height);
//    ctx.drawImage(image, 0, 0);
//    return ctx.getImageData(0, 0, image.width, image.height);
//}

//let imgs = getImgs();
//imgs.map(img => {
//    localizedImage(img.src)
//    .then(localImg => getImageData(localImg))
//    .then(imgData => {
//        console.log(imgData);
//        let isSafe = inspectImg(imgData);
//        
//        if (!isSafe) {
//            let w = img.width;
//            let h = img.height;
//            img.src = 'https://ipsumimage.appspot.com/' + w + 'x' + h;
//        }
//        console.log(isSafe);
//    });
//});

/* Send to custom server for processing in another language */
//let sendUrls = (urls) => {
//    
//    message = {'urls': urls};
//    
//    chrome.runtime.sendMessage(message, (response) => {
//        console.log(response);
//    });
//    
//    let url = new URL('https://image-processing.glitch.me/api'),
//        params = {urls: urls};
//    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
//    
//    fetch(url)
//    .then(response => response.json())
//    .then(result => {
//        console.log(result);
//    })
//}
