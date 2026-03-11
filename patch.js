// ── Normalize: buttons[].nativeFlowInfo -> interactiveButtons ──────
if (
    typeof content === 'object' &&
    Array.isArray(content.buttons) &&
    content.buttons.length > 0 &&
    content.buttons.some(b => b.nativeFlowInfo)
) {
    const interactiveButtons = content.buttons.map(b => {
        if (b.nativeFlowInfo) {
            return {
                name: b.nativeFlowInfo.name,
                buttonParamsJson: b.nativeFlowInfo.paramsJson || '{}'
            };
        }
        return {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: b.buttonText?.displayText || b.buttonId || 'Button',
                id: b.buttonId || b.buttonText?.displayText || 'btn'
            })
        };
    });
    const { buttons, headerType, viewOnce, ...rest } = content;
    content = { ...rest, interactiveButtons };
}

// ── Interactive Button (sendButton logic) ──────────────────────────
if (typeof content === 'object' && Array.isArray(content.interactiveButtons) && content.interactiveButtons.length > 0) {
    const {
        text = '', caption = '', title = '', footer = '',
        interactiveButtons, hasMediaAttachment = false,
        image = null, video = null, document = null,
        mimetype = null, jpegThumbnail = null, location = null,
        product = null, businessOwnerJid = null, externalAdReply = null,
    } = content;

    const processedButtons = [];
    for (let i = 0; i < interactiveButtons.length; i++) {
        const btn = interactiveButtons[i];
        if (!btn || typeof btn !== 'object') throw new Error(`interactiveButtons[${i}] must be an object`);
        if (btn.name && btn.buttonParamsJson) { processedButtons.push(btn); continue; }
        if (btn.id || btn.text || btn.displayText) {
            processedButtons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: btn.text || btn.displayText || `Button ${i + 1}`, id: btn.id || `quick_${i + 1}` }) });
            continue;
        }
        if (btn.buttonId && btn.buttonText?.displayText) {
            processedButtons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: btn.buttonText.displayText, id: btn.buttonId }) });
            continue;
        }
        throw new Error(`interactiveButtons[${i}] has invalid shape`);
    }

    let messageContent = {};
    if (image) {
        const mi = Buffer.isBuffer(image) ? { image } : { image: { url: typeof image === 'object' ? image.url : image } };
        const pm = await(0, Utils_1.prepareWAMessageMedia)(mi, { upload: waUploadToServer });
        messageContent.header = { title: title || '', hasMediaAttachment: true, imageMessage: pm.imageMessage };
    } else if (video) {
        const mi = Buffer.isBuffer(video) ? { video } : { video: { url: typeof video === 'object' ? video.url : video } };
        const pm = await(0, Utils_1.prepareWAMessageMedia)(mi, { upload: waUploadToServer });
        messageContent.header = { title: title || '', hasMediaAttachment: true, videoMessage: pm.videoMessage };
    } else if (document) {
        const mi = Buffer.isBuffer(document) ? { document } : { document: { url: typeof document === 'object' ? document.url : document } };
        if (mimetype && typeof mi.document === 'object') mi.document.mimetype = mimetype;
        if (jpegThumbnail) {
            const thumb = Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : await(async () => { try { const r = await fetch(jpegThumbnail); return Buffer.from(await r.arrayBuffer()); } catch { return undefined; } })();
            if (thumb) mi.document.jpegThumbnail = thumb;
        }
        const pm = await(0, Utils_1.prepareWAMessageMedia)(mi, { upload: waUploadToServer });
        messageContent.header = { title: title || '', hasMediaAttachment: true, documentMessage: pm.documentMessage };
    } else if (location && typeof location === 'object') {
        messageContent.header = { title: title || location.name || 'Location', hasMediaAttachment: false, locationMessage: { degreesLatitude: location.degreesLatitude || location.degressLatitude || 0, degreesLongitude: location.degreesLongitude || location.degressLongitude || 0, name: location.name || '', address: location.address || '' } };
    } else if (product && typeof product === 'object') {
        let productImageMessage = null;
        if (product.productImage) {
            const mi = Buffer.isBuffer(product.productImage) ? { image: product.productImage } : { image: { url: typeof product.productImage === 'object' ? product.productImage.url : product.productImage } };
            const pm = await(0, Utils_1.prepareWAMessageMedia)(mi, { upload: waUploadToServer });
            productImageMessage = pm.imageMessage;
        }
        messageContent.header = { title: title || product.title || 'Product', hasMediaAttachment: false, productMessage: { product: { productImage: productImageMessage, productId: product.productId || '', title: product.title || '', description: product.description || '', currencyCode: product.currencyCode || 'USD', priceAmount1000: parseInt(product.priceAmount1000) || 0, retailerId: product.retailerId || '', url: product.url || '', productImageCount: product.productImageCount || 1 }, businessOwnerJid: businessOwnerJid || product.businessOwnerJid || authState.creds.me.id } };
    } else if (title) {
        messageContent.header = { title, hasMediaAttachment: false };
    }

    const hasMedia = !!(image || video || document || location || product);
    const bodyText = hasMedia ? caption : text || caption;
    if (bodyText) messageContent.body = { text: bodyText };
    if (footer) messageContent.footer = { text: footer };
    messageContent.nativeFlowMessage = { buttons: processedButtons };

    if (externalAdReply && typeof externalAdReply === 'object') {
        messageContent.contextInfo = { externalAdReply: { title: externalAdReply.title || '', body: externalAdReply.body || '', mediaType: externalAdReply.mediaType || 1, sourceUrl: externalAdReply.sourceUrl || externalAdReply.url || '', thumbnailUrl: externalAdReply.thumbnailUrl || externalAdReply.thumbnail || '', renderLargerThumbnail: externalAdReply.renderLargerThumbnail || false, showAdAttribution: externalAdReply.showAdAttribution !== false, containsAutoReply: externalAdReply.containsAutoReply || false, ...(externalAdReply.mediaUrl && { mediaUrl: externalAdReply.mediaUrl }), ...(Buffer.isBuffer(externalAdReply.thumbnail) && { thumbnail: externalAdReply.thumbnail }), ...(externalAdReply.jpegThumbnail && { jpegThumbnail: externalAdReply.jpegThumbnail }) }, ...(options.mentionedJid && { mentionedJid: options.mentionedJid }) };
    } else if (options.mentionedJid) {
        messageContent.contextInfo = { mentionedJid: options.mentionedJid };
    }

    const payload = WAProto_1.proto.Message.InteractiveMessage.create(messageContent);
    const msg = (0, Utils_1.generateWAMessageFromContent)(jid, { viewOnceMessage: { message: { interactiveMessage: payload } } }, { userJid: authState.creds.me.id, quoted: options?.quoted || null });
    const additionalNodes = [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }];
    await relayMessage(jid, msg.message, { messageId: msg.key.id, additionalNodes });
    return msg;
}
// ── End Interactive Button ─────────────────────────────────────────

