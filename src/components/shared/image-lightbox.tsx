"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Captions from "yet-another-react-lightbox/plugins/captions";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface Slide {
  src: string;
  title?: string;
  description?: string;
}

interface ImageLightboxProps {
  open: boolean;
  close: () => void;
  slides: Slide[];
  index?: number;
}

export default function ImageLightbox({ open, close, slides, index = 0 }: ImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
      plugins={[Zoom, Fullscreen, Captions]}
      carousel={{
        finite: slides.length <= 1,
      }}
      render={{
        buttonPrev: slides.length <= 1 ? () => null : undefined,
        buttonNext: slides.length <= 1 ? () => null : undefined,
      }}
      zoom={{
        maxZoomPixelRatio: 5,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
      }}
      captions={{
        descriptionTextAlign: "center",
        descriptionMaxLines: 4,
      }}
    />
  );
}
