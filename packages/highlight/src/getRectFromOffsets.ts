/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2023 Nguyen Huu Phuoc <me@phuoc.ng>
 */

export const getRectFromOffsets = (textDiv: HTMLElement, startOffset: number, endOffset: number): DOMRect | null => {
    const clonedEle = textDiv.cloneNode(true);

    try {
        textDiv.parentNode.appendChild(clonedEle);

        const firstChild = clonedEle.firstChild;
        const range = new Range();
        range.setStart(firstChild, startOffset);
        range.setEnd(firstChild, endOffset);

        const wrapper = document.createElement('span');
        range.surroundContents(wrapper);

        const rect = wrapper.getBoundingClientRect();

        // Remove the clone element
        clonedEle.parentNode.removeChild(clonedEle);

        return rect;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'IndexSizeError') {
            clonedEle.parentNode.removeChild(clonedEle);
            return null;
        }
        throw error;
    }
};
