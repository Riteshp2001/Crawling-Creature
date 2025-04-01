interface BaseObject {
	x: number;
	y: number;
	absAngle: number;
	children: any[];
}

export class Segment {
	isSegment: boolean;
	parent: BaseObject;
	children: Segment[];
	size: number;
	relAngle: number;
	defAngle: number;
	absAngle: number;
	range: number;
	stiffness: number;
	x: number;
	y: number;
	ctx: CanvasRenderingContext2D;

	constructor(
		parent: BaseObject,
		size: number,
		angle: number,
		range: number,
		stiffness: number,
		ctx: CanvasRenderingContext2D
	) {
		this.isSegment = true;
		this.parent = parent;
		if (typeof parent.children === "object") {
			parent.children.push(this);
		}
		this.children = [];
		this.size = size;
		this.relAngle = angle;
		this.defAngle = angle;
		this.absAngle = parent.absAngle + angle;
		this.range = range;
		this.stiffness = stiffness;
		this.x = 0;
		this.y = 0;
		this.ctx = ctx;
		this.updateRelative(false, true);
	}

	updateRelative(iter: boolean, flex: boolean) {
		this.relAngle =
			this.relAngle -
			2 *
				Math.PI *
				Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);

		if (flex) {
			this.relAngle = Math.min(
				this.defAngle + this.range / 2,
				Math.max(
					this.defAngle - this.range / 2,
					(this.relAngle - this.defAngle) / this.stiffness + this.defAngle
				)
			);
		}

		this.absAngle = this.parent.absAngle + this.relAngle;
		this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
		this.y = this.parent.y + Math.sin(this.absAngle) * this.size;

		if (iter) {
			for (const child of this.children) {
				child.updateRelative(iter, flex);
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, iter: boolean) {
		ctx.beginPath();
		ctx.moveTo(this.parent.x, this.parent.y);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();

		if (iter) {
			for (const child of this.children) {
				child.draw(ctx, true);
			}
		}
	}

	follow(iter: boolean) {
		const x = this.parent.x;
		const y = this.parent.y;
		const dist = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);

		this.x = x + (this.size * (this.x - x)) / dist;
		this.y = y + (this.size * (this.y - y)) / dist;
		this.absAngle = Math.atan2(this.y - y, this.x - x);
		this.relAngle = this.absAngle - this.parent.absAngle;
		this.updateRelative(false, true);

		if (iter) {
			for (const child of this.children) {
				child.follow(true);
			}
		}
	}
}

export class LegSystem {
	end: Segment;
	length: number;
	creature: Creature;
	speed: number;
	nodes: Segment[];
	hip: BaseObject;
	goalX: number;
	goalY: number;
	step: number;
	forwardness: number;
	reach: number;
	swing: number;
	swingOffset: number;

	constructor(end: Segment, length: number, speed: number, creature: Creature) {
		this.end = end;
		this.length = Math.max(1, length);
		this.creature = creature;
		this.speed = speed;
		creature.systems.push(this);

		this.nodes = [];
		let node: any = end;
		for (let i = 0; i < length; i++) {
			this.nodes.unshift(node);
			node = node.parent;
			if (!node.isSegment) {
				this.length = i + 1;
				break;
			}
		}

		this.hip = this.nodes[0].parent;
		this.goalX = end.x;
		this.goalY = end.y;
		this.step = 0;
		this.forwardness = 0;

		this.reach =
			0.9 *
			Math.sqrt(
				(this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2
			);
		let relAngle =
			this.creature.absAngle -
			Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
		relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);
		this.swing = -relAngle + ((2 * Number(relAngle < 0) - 1) * Math.PI) / 2;
		this.swingOffset = this.creature.absAngle - this.hip.absAngle;
	}

	moveTo(x: number, y: number) {
		this.nodes[0].updateRelative(true, true);
		const dist = Math.sqrt((x - this.end.x) ** 2 + (y - this.end.y) ** 2);
		let len = Math.max(0, dist - this.speed);

		for (let i = this.nodes.length - 1; i >= 0; i--) {
			const node = this.nodes[i];
			const ang = Math.atan2(node.y - y, node.x - x);
			node.x = x + len * Math.cos(ang);
			node.y = y + len * Math.sin(ang);
			x = node.x;
			y = node.y;
			len = node.size;
		}

		for (const node of this.nodes) {
			node.absAngle = Math.atan2(
				node.y - node.parent.y,
				node.x - node.parent.x
			);
			node.relAngle = node.absAngle - node.parent.absAngle;
			for (const childNode of node.children) {
				if (!this.nodes.includes(childNode)) {
					childNode.updateRelative(true, false);
				}
			}
		}
	}

	update() {
		this.moveTo(this.goalX, this.goalY);

		if (this.step === 0) {
			const dist = Math.sqrt(
				(this.end.x - this.goalX) ** 2 + (this.end.y - this.goalY) ** 2
			);
			if (dist > 1) {
				this.step = 1;
				this.goalX =
					this.hip.x +
					this.reach *
						Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
					((2 * Math.random() - 1) * this.reach) / 2;
				this.goalY =
					this.hip.y +
					this.reach *
						Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
					((2 * Math.random() - 1) * this.reach) / 2;
			}
		} else if (this.step === 1) {
			const theta =
				Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
				this.hip.absAngle;
			const dist = Math.sqrt(
				(this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2
			);
			const forwardness2 = dist * Math.cos(theta);
			const dF = this.forwardness - forwardness2;
			this.forwardness = forwardness2;

			if (dF * dF < 1) {
				this.step = 0;
				this.goalX = this.hip.x + (this.end.x - this.hip.x);
				this.goalY = this.hip.y + (this.end.y - this.hip.y);
			}
		}
	}
}

export class Creature {
	x: number;
	y: number;
	absAngle: number;
	fSpeed: number;
	fAccel: number;
	fFric: number;
	fRes: number;
	fThresh: number;
	rSpeed: number;
	rAccel: number;
	rFric: number;
	rRes: number;
	rThresh: number;
	children: any[];
	systems: any[];
	speed: number;
	ctx: CanvasRenderingContext2D;

	constructor(
		x: number,
		y: number,
		angle: number,
		fAccel: number,
		fFric: number,
		fRes: number,
		fThresh: number,
		rAccel: number,
		rFric: number,
		rRes: number,
		rThresh: number,
		ctx: CanvasRenderingContext2D
	) {
		this.x = x;
		this.y = y;
		this.absAngle = angle;
		this.fSpeed = 0;
		this.fAccel = fAccel;
		this.fFric = fFric;
		this.fRes = fRes;
		this.fThresh = fThresh;
		this.rSpeed = 0;
		this.rAccel = rAccel;
		this.rFric = rFric;
		this.rRes = rRes;
		this.rThresh = rThresh;
		this.children = [];
		this.systems = [];
		this.speed = 0;
		this.ctx = ctx;
	}

	follow(x: number, y: number) {
		const dist = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
		const angle = Math.atan2(y - this.y, x - this.x);

		let accel = this.fAccel;
		if (this.systems.length > 0) {
			const sum = this.systems.reduce(
				(acc, sys) => acc + (sys.step === 0 ? 1 : 0),
				0
			);
			accel *= sum / this.systems.length;
		}

		this.fSpeed += accel * (dist > this.fThresh ? 1 : 0);
		this.fSpeed *= 1 - this.fRes;
		this.speed = Math.max(0, this.fSpeed - this.fFric);

		let dif = this.absAngle - angle;
		dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);

		if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
			this.rSpeed -= this.rAccel * (2 * Number(dif > 0) - 1);
		}

		this.rSpeed *= 1 - this.rRes;
		if (Math.abs(this.rSpeed) > this.rFric) {
			this.rSpeed -= this.rFric * (2 * Number(this.rSpeed > 0) - 1);
		} else {
			this.rSpeed = 0;
		}

		this.absAngle += this.rSpeed;
		this.absAngle -=
			2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
		this.x += this.speed * Math.cos(this.absAngle);
		this.y += this.speed * Math.sin(this.absAngle);

		this.absAngle += Math.PI;
		for (const child of this.children) {
			child.follow(true);
		}
		for (const system of this.systems) {
			system.update();
		}
		this.absAngle -= Math.PI;
	}

	draw(ctx: CanvasRenderingContext2D, iter: boolean) {
		const r = 4;
		ctx.beginPath();
		ctx.arc(
			this.x,
			this.y,
			r,
			Math.PI / 4 + this.absAngle,
			(7 * Math.PI) / 4 + this.absAngle
		);
		ctx.moveTo(
			this.x + r * Math.cos((7 * Math.PI) / 4 + this.absAngle),
			this.y + r * Math.sin((7 * Math.PI) / 4 + this.absAngle)
		);
		ctx.lineTo(
			this.x + r * Math.cos(this.absAngle) * Math.SQRT2,
			this.y + r * Math.sin(this.absAngle) * Math.SQRT2
		);
		ctx.lineTo(
			this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
			this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
		);
		ctx.stroke();

		if (iter) {
			for (const child of this.children) {
				child.draw(ctx, true);
			}
		}
	}
}
