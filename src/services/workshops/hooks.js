function XMLChanged(context) {
    if (context.data.hasOwnProperty('xml')) {
        context.service.emit('xml-changed', { workshop: context.result });
    }
}

module.exports = { XMLChanged };
