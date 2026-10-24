'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './newsletter.module.css';

// ponytail: native <dialog> gives us Esc, focus trap and backdrop for free
export default function Gallery({ title, srcs }) {
    const [i, setI] = useState(null);
    const dialog = useRef(null);
    const strip = useRef(null);
    const touchX = useRef(null);

    useEffect(() => {
        if (i === null) dialog.current?.close();
        else dialog.current?.showModal();
    }, [i]);

    // keep the active filmstrip thumb in view
    useEffect(() => {
        strip.current?.children[i]?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, [i]);

    if (!srcs.length) return null;

    const step = (n) => setI((cur) => (cur + n + srcs.length) % srcs.length);

    return (
        <section className={styles.gallerySection}>
            <h3 className={styles.galleryTitle}>{title}</h3>

            <div className={styles.galleryGrid}>
                {srcs.map((src, j) => (
                    <button key={src} type="button" className={styles.galleryThumb} onClick={() => setI(j)}>
                        <Image src={src} alt="" fill sizes="(max-width: 600px) 33vw, 200px" />
                    </button>
                ))}
            </div>

            <dialog
                ref={dialog}
                className={styles.lightbox}
                onClose={() => setI(null)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') step(1);
                    if (e.key === 'ArrowLeft') step(-1);
                }}
            >
                {i !== null && (
                    <div className={styles.lightboxInner}>
                        <button type="button" className={styles.lightboxClose} onClick={() => setI(null)} aria-label="Close">×</button>

                        <div
                            className={styles.lightboxStageWrap}
                            onClick={(e) => e.target === e.currentTarget && setI(null)}
                            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                            onTouchEnd={(e) => {
                                const dx = e.changedTouches[0].clientX - touchX.current;
                                if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
                            }}
                        >
                            <button type="button" className={styles.lightboxPrev} onClick={() => step(-1)} aria-label="Previous photo">‹</button>
                            <div className={styles.lightboxStage}>
                                <Image src={srcs[i]} alt="" fill sizes="100vw" className={styles.lightboxImage} priority />
                            </div>
                            <button type="button" className={styles.lightboxNext} onClick={() => step(1)} aria-label="Next photo">›</button>
                        </div>

                        <div className={styles.filmstrip} ref={strip}>
                            {srcs.map((src, j) => (
                                <button
                                    key={src}
                                    type="button"
                                    className={j === i ? `${styles.filmThumb} ${styles.filmThumbActive}` : styles.filmThumb}
                                    onClick={() => setI(j)}
                                    aria-label={`Photo ${j + 1}`}
                                >
                                    <Image src={src} alt="" fill sizes="64px" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </dialog>
        </section>
    );
}
