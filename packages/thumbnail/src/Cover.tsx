/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2024 Nguyen Huu Phuoc <me@phuoc.ng>
 */

'use client';

import { Spinner, type PdfJs, type Store, type StoreHandler } from '@react-pdf-viewer/core';
import * as React from 'react';
import { CoverInner } from './CoverInner';
import styles from './styles/cover.module.css';
import { StoreProps } from './types/StoreProps';

export const Cover: React.FC<{
    getPageIndex?({ numPages }: { numPages: number }): number;
    renderSpinner?: () => React.ReactElement;
    store: Store<StoreProps>;
    width?: number;
}> = ({ getPageIndex, renderSpinner, store, width }) => {
    const [currentDoc, setCurrentDoc] = React.useState<PdfJs.PdfDocument>(store.get('doc')!);

    const handleDocumentChanged: StoreHandler<PdfJs.PdfDocument> = (doc: PdfJs.PdfDocument) => {
        setCurrentDoc(doc);
    };

    React.useEffect(() => {
        store.subscribe('doc', handleDocumentChanged);

        return () => {
            store.unsubscribe('doc', handleDocumentChanged);
        };
    }, []);

    return (
        <div className={styles.cover}>
            {currentDoc ? (
                <CoverInner
                    doc={currentDoc}
                    getPageIndex={getPageIndex}
                    renderSpinner={renderSpinner}
                    store={store}
                    width={width}
                />
            ) : (
                <div className={styles.loader}>{renderSpinner ? renderSpinner() : <Spinner />}</div>
            )}
        </div>
    );
};
