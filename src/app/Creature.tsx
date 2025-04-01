"use client";

import { useEffect, useRef, useState } from "react";
import { setupInput, Input } from "./utils/input";
import { Creature, Segment, LegSystem } from "./utils/Creature";

export default function CreatureCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isClient, setIsClient] = useState(false);
	const creatureRef = useRef<Creature | null>(null);

	// State for creature parameters
	const [creatureParams, setCreatureParams] = useState({
		size: 8,
		legs: 4,
		tail: 12,
		color: "white",
		strokeWidth: 2,
	});

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Setup canvas size
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Setup input handling
		setupInput();

		// Setup creature
		const setupLizard = (size: number, legs: number, tail: number) => {
			const s = size;
			const critter = new Creature(
				window.innerWidth / 2,
				window.innerHeight / 2,
				0,
				s * 10,
				s * 2,
				0.5,
				16,
				0.5,
				0.085,
				0.5,
				0.3,
				ctx
			);

			let spinal: Creature | Segment = critter;

			// Neck
			for (let i = 0; i < 6; i++) {
				spinal = new Segment(spinal, s * 4, 0, (3.1415 * 2) / 3, 1.1, ctx);
				for (let ii = -1; ii <= 1; ii += 2) {
					let node = new Segment(spinal, s * 3, ii, 0.1, 2, ctx);
					for (let iii = 0; iii < 3; iii++) {
						node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2, ctx);
					}
				}
			}

			// Torso and legs
			for (let i = 0; i < legs; i++) {
				if (i > 0) {
					// Vertebrae and ribs
					for (let ii = 0; ii < 6; ii++) {
						spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5, ctx);
						for (let iii = -1; iii <= 1; iii += 2) {
							let node = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5, ctx);
							for (let iv = 0; iv < 3; iv++) {
								node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2, ctx);
							}
						}
					}
				}

				// Legs and shoulders
				for (let ii = -1; ii <= 1; ii += 2) {
					let node = new Segment(spinal, s * 12, ii * 0.785, 0, 8, ctx);
					node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1, ctx);
					node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2, ctx);
					for (let iii = 0; iii < 4; iii++) {
						new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4, ctx);
					}
					new LegSystem(node, 3, s * 12, critter);
				}
			}

			// Tail
			for (let i = 0; i < tail; i++) {
				spinal = new Segment(spinal, s * 4, 0, (3.1415 * 2) / 3, 1.1, ctx);
				for (let ii = -1; ii <= 1; ii += 2) {
					let node = new Segment(spinal, s * 3, ii, 0.1, 2, ctx);
					for (let iii = 0; iii < 3; iii++) {
						node = new Segment(
							node,
							(s * 3 * (tail - i)) / tail,
							-ii * 0.1,
							0.1,
							2,
							ctx
						);
					}
				}
			}

			return critter;
		};

		// Initialize creature with current parameters
		const critter = setupLizard(
			creatureParams.size / Math.sqrt(creatureParams.legs),
			creatureParams.legs,
			creatureParams.tail
		);
		creatureRef.current = critter;

		// Animation loop
		let animationFrameId: number;
		const animate = () => {
			if (!canvas || !ctx || !creatureRef.current) return;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = creatureParams.color;
			ctx.lineWidth = creatureParams.strokeWidth;
			creatureRef.current.follow(Input.mouse.x, Input.mouse.y);
			creatureRef.current.draw(ctx, true);
			animationFrameId = requestAnimationFrame(animate);
		};
		animate();

		// Cleanup
		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [isClient, creatureParams]);

	return (
		<div className="w-full h-full relative flex items-center justify-center p-4 bg-gray-900">
			<canvas ref={canvasRef} className="w-full h-full" />
			<div className="absolute top-4 left-4 p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20 text-white space-y-4 w-72">
				<h2 className="text-xl font-semibold text-center">Creature Controls</h2>
				<div className="space-y-4">
					{/* Size Control */}
					<label className="flex flex-col">
						<span className="text-sm">Creature Size (Max: 25):</span>
						<input
							type="range"
							min="1"
							max="25"
							value={creatureParams.size}
							className="w-full accent-blue-500"
							onChange={(e) =>
								setCreatureParams({
									...creatureParams,
									size: Number(e.target.value),
								})
							}
						/>
						<span className="text-xs text-gray-300">
							Current: {creatureParams.size}
						</span>
					</label>

					{/* Legs Control */}
					<label className="flex flex-col">
						<span className="text-sm">Legs (Min: 1):</span>
						<input
							type="number"
							min="1"
							value={creatureParams.legs}
							className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
							onChange={(e) =>
								setCreatureParams({
									...creatureParams,
									legs: Math.max(1, Number(e.target.value)),
								})
							}
						/>
					</label>

					{/* Tail Control */}
					<label className="flex flex-col">
						<span className="text-sm">Tail (Min: 1):</span>
						<input
							type="number"
							min="1"
							value={creatureParams.tail}
							className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
							onChange={(e) =>
								setCreatureParams({
									...creatureParams,
									tail: Math.max(1, Number(e.target.value)),
								})
							}
						/>
					</label>

					{/* Color Control */}
					<label className="flex items-center justify-between">
						<span className="text-sm">Color:</span>
						<div className="flex items-center space-x-2">
							<input
								type="color"
								value={creatureParams.color}
								className="w-10 h-8 p-1 rounded-lg border border-gray-600 bg-gray-800"
								onChange={(e) =>
									setCreatureParams({
										...creatureParams,
										color: e.target.value,
									})
								}
							/>
							<div
								className="w-8 h-8 rounded-lg border border-gray-600"
								style={{ backgroundColor: creatureParams.color }}
							></div>
						</div>
					</label>

					{/* Stroke Width Control */}
					<label className="flex flex-col">
						<span className="text-sm">Stroke Width (Max: 15):</span>
						<input
							type="range"
							min="1"
							max="15"
							value={creatureParams.strokeWidth}
							className="w-full accent-blue-500"
							onChange={(e) =>
								setCreatureParams({
									...creatureParams,
									strokeWidth: Number(e.target.value),
								})
							}
						/>
						<span className="text-xs text-gray-300">
							Current: {creatureParams.strokeWidth}
						</span>
					</label>
				</div>
			</div>
		</div>
	);
}
