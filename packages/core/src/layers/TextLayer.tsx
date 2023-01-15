/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2023 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import * as React from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { LayerRenderStatus } from '../structs/LayerRenderStatus';
import type { PdfJs } from '../types/PdfJs';
import type { Plugin } from '../types/Plugin';
import { PdfJsApi } from '../vendors/PdfJsApi';

export const TextLayer: React.FC<{
    containerRef: React.MutableRefObject<HTMLDivElement>;
    page: PdfJs.Page;
    pageIndex: number;
    plugins: Plugin[];
    rotation: number;
    scale: number;
    onRenderTextCompleted: () => void;
}> = ({ containerRef, page, pageIndex, plugins, rotation, scale, onRenderTextCompleted }) => {
    const renderTask = React.useRef<PdfJs.PageRenderTask>();

    const empty = (): void => {
        const containerEle = containerRef.current;
        if (!containerEle) {
            return;
        }

        const spans: HTMLElement[] = [].slice.call(containerEle.querySelectorAll('.rpv-core__text-layer-text'));
        spans.forEach((span) => containerEle.removeChild(span));

        // Remove more elements generated by pdf.js
        const breaks: HTMLElement[] = [].slice.call(containerEle.querySelectorAll('br[role="presentation"]'));
        breaks.forEach((br) => containerEle.removeChild(br));
    };

    useIsomorphicLayoutEffect(() => {
        const task = renderTask.current;
        if (task) {
            task.cancel();
        }

        const containerEle = containerRef.current;
        if (!containerEle) {
            return;
        }
        containerEle.removeAttribute('data-testid');
        const viewport = page.getViewport({ rotation, scale });

        plugins.forEach((plugin) => {
            if (plugin.onTextLayerRender) {
                plugin.onTextLayerRender({
                    ele: containerEle,
                    pageIndex,
                    scale,
                    status: LayerRenderStatus.PreRender,
                });
            }
        });
        page.getTextContent().then((textContent) => {
            empty();
            renderTask.current = PdfJsApi.renderTextLayer({
                container: containerEle,
                // From pdf-js 3.2.146, the `textContent` parameter is deprecated 
                // and will be soon replaced with the `textContentSource` parameter
                textContent: textContent as any,
                textContentSource: textContent as any,
                viewport: viewport as any,
            });
            renderTask.current.promise.then(
                () => {
                    containerEle.setAttribute('data-testid', `core__text-layer-${pageIndex}`);
                    const spans: HTMLElement[] = [].slice.call(containerEle.children);
                    spans.forEach((span) => {
                        // Distinguish with other elements created by plugins
                        if (!span.classList.contains('rpv-core__text-layer-text--not')) {
                            span.classList.add('rpv-core__text-layer-text');
                        }
                    });

                    plugins.forEach((plugin) => {
                        if (plugin.onTextLayerRender) {
                            plugin.onTextLayerRender({
                                ele: containerEle,
                                pageIndex,
                                scale,
                                status: LayerRenderStatus.DidRender,
                            });
                        }
                    });
                    onRenderTextCompleted();
                },
                () => {
                    containerEle.removeAttribute('data-testid');
                    onRenderTextCompleted();
                }
            );
        });

        return () => {
            // Prevent the issue where the unit tests say that there are many text found in the React 18's Strict mode
            empty();
            renderTask.current?.cancel();
        };
    }, []);

    return <div className="rpv-core__text-layer" ref={containerRef} />;
};
