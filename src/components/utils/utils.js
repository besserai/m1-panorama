const imageDataFromUrl = async (url) => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = reject;
        img.src = url;
    });
}

export const loadTestImages = async (dir = "test_images/Alfred", verbose = false) => {
    let panoramaImages = []
    let dir_content = null
    try {
        dir_content = await fetch(`${dir}/dir_content.json`).then(response => response.json());
    } catch (error) {
        console.error("error loading dir_content.json", error)
    }

    verbose && console.log("dir_content", dir_content)
    verbose && console.log("dir_content", dir_content.images)

    for (let i = 0; i < dir_content.images.length; i++) {
        const imageUrl = `${dir}/${dir_content.images[i]}`
        let viewDirection = null

        try {
            const viewDirUrl = `${dir}/${dir_content.viewDirections[i]}`
            verbose && console.log("viewDirUrl", viewDirUrl)
            try {
                const viewDirUrl = `${dir}/${dir_content.viewDirections[i]}`
                viewDirection = await fetch(viewDirUrl).then(response => response.json());
            } catch (error) {
                console.log("no view dir in test_images")
            }
            verbose && console.log("viewDirection", i, viewDirection)
            verbose && console.log("imageUrl", imageUrl)

            const imageData = await imageDataFromUrl(imageUrl)

            panoramaImages.push({
                imageData: imageData,
                imageUrl: imageUrl,
                viewDirection: viewDirection
            })
        } catch (error) {
            console.warn("error loading image", error)
        }
    }

    let testMask = null

    try {
        const maskUrl = `${dir}/test_mask.png`
        verbose && console.log("maskUrl", maskUrl)
        const maskImageData = await imageDataFromUrl(maskUrl)
        testMask = maskImageData
    } catch (error) {
        console.warn("[loadTestImages] no test mask in test_images")
    }

    verbose && console.log("panoramaImages", panoramaImages)

    return { panoramaImages, testMask }
}
