import { Capsule, Playable } from "./element";
import Pos, { Box } from "./position";
import p5 from "p5";
import { Player } from "tone";
import { controlBarHeight } from "./canvas";
import * as Tone from "tone";
import Icon from "./icon";

const sampleOutline = "#314814";

export default class Sample extends Playable {
    player: Player;
    icon: Icon;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, sample: string) {
        super(pos, size, p, parent, true);
        this.player = new Player(sample).toDestination();
        this.pauseTime = 0;
        this.updateStartTime();
        this.icon = new Icon(pos, size, p, this);
    }

    play(master = false): void {
        this.player.start(0, this.pauseTime - this.startTime);
        console.log("Playing sample at:" + Tone.getTransport().seconds);
    }

    pause(master = false): void {
        this.pauseTime = this.player.sampleTime;
        this.player.stop();
    }

    stop(master = false): void {
        this.player.stop();
    }

    schedule(): void {
        this.unschedule();
        this.scheduleId = Tone.Transport.schedule((time) => {
            if (this.parent.playing) {
                this.play();
                this.pauseTime = 0;
            }
        }, this.startTime);
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(sampleOutline);
        stroke.setAlpha(alpha);
        this.simpleRect(offset, stroke, null);
        this.icon.draw(offset, alpha);
    }

    topUnderPos(offset: Pos, pos: Pos): Sample {
        if (Pos.inBox(Pos.sum(this.pos, offset), this.size, pos)) {
            return this;
        }
        return null;
    }

    moveTo(pos: Pos): void {
        let newBox = Box.within(new Box(pos, this.size), this.parent.inner);
        this.setPos(newBox.origin);
        this.updateStartTime();
    }
}