import Element from "./element";

export default interface Playable extends Element{
    play(): void;
    pause(): void;
    stop(): void;
}