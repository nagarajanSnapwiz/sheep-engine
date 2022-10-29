export const PIXELS_PER_METRE = 32;

export function canvasToPhys(pixels: number){
    return pixels/PIXELS_PER_METRE;
}

export function physToCanvas(metres: number){
    return metres* PIXELS_PER_METRE;
}