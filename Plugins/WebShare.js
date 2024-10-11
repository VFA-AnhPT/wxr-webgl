const WebShare = {
    shareImage: (text, url, base64ImageString) => {
        const toBlob = (base64String) => {
            const decodedData = atob(base64String.replace(/^.*,/, ''));
            const buffers = new Uint8Array(decodedData.length);
            for (let i = 0; i < decodedData.length; i++) {
                buffers[i] = decodedData.charCodeAt(i);
            }
            try {
                const blob = new Blob([buffers.buffer], {
                    type: 'image/png',
                });
                return blob;
            } catch (e) {
                return null;
            }
        };

        const blob = toBlob(base64ImageString);
        const imageFile = new File([blob], 'image.png', {
            type: 'image/png',
        });

        navigator.share({
            text: text,
            url: url,
            files: [imageFile],
        }).then(() => {
            console.log('Shareing Success.');
        }).catch((error) => {
            console.log(error);
        });
    }
};
