'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const VideoComponent = () => {
    return (
        <div className="bg-muted relative hidden lg:block overflow-hidden">
            <video
                src="/backgrounds/auth/auth.bg.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6] dark:grayscale"
            />

            <div className="flex flex-col items-center justify-center absolute inset-0 pointer-events-none flex flex-col justify-center px-16 gap-6">
                <div className="bg-black/35 backdrop-blur-2xl
    rounded-sm
    p-3
    border border-white/10
    shadow-[0_0_40px_rgba(0,0,0,0.45)]
    pointer-events-none w-full">
                    <h5 className="text-white font-semibold text-base tracking-wide text-xs">
                        Enterprise Transactional Email Delivery Infrastructure
                    </h5>
                </div>
                <div className="flex items-end justify-center gap-6">
                    <div className="">
                        <div className="max-w-md space-y-3">
                            <h2 className="text-sm font-semibold tracking-wider text-gray-300">
                                AlphaFusion's PostDepot
                            </h2>

                            <h1 className="text-3xl font-bold text-white leading-tight">
                                Welcome to PostDepot
                            </h1>

                            <p className="text-gray-300 text-sm leading-relaxed">
                                PostDepot is a high-performance transactional email platform engineered to reliably deliver system-critical emails at scale across Gmail, Outlook, Yahoo, ProtonMail, Zoho, and iCloud.
                            </p>

                            <p className="text-gray-400 text-xs pt-1">
                                One <span className="text-purple-400 font-semibold">System</span>. Maximums <span className="text-purple-400 font-semibold">Deliverability</span>. Absolute <span className="text-purple-400 font-semibold">Control</span>.
                            </p>
                        </div>
                        <div
                            className="
        mt-10 max-w-md
        bg-black/40 backdrop-blur-xl
        rounded-sm p-6
        border border-white/10 
        shadow-[0px_0px_50px_rgba(0,0,0,0.35)]
      "
                        >
                            <h3 className="text-white font-semibold text-lg">
                                High-Throughput Transactional Dispatch
                            </h3>

                            <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                                Queue-based email dispatch with domain-aware throttling, intelligent retries, and SMTP reputation protection — built for mission-critical messaging.
                            </p>

                            {/* Profile Avatars Cluster */}
                            <div className="flex items-center mt-4">
                                <Image
                                    src="/avatars/a1.png"
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="rounded-full border border-white/20"
                                />
                                <Image
                                    src="/avatars/a2.png"
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="-ml-2 rounded-full border border-white/20"
                                />
                                <Image
                                    src="/avatars/a3.png"
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="-ml-2 rounded-full border border-white/20"
                                />

                                <span
                                    className="
            ml-3 text-xs text-gray-300 
            bg-white/10 px-3 py-1 rounded-full 
            border border-white/10 backdrop-blur-md
          "
                                >
                                    Trusted for 600k+ emails / day
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="
    w-[320px]
    bg-black/35 backdrop-blur-2xl
    rounded-sm
    p-5
    border border-white/10
    shadow-[0_0_40px_rgba(0,0,0,0.45)]
    pointer-events-none
  "
                    >
                        <h3 className="text-white font-semibold text-base tracking-wide mb-4">
                            Real-Time Email Dispatch Stream
                        </h3>

                        <div className="relative flex flex-col gap-1">

                            {/* Node 1 */}
                            <div className="relative flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-4 w-4 bg-purple-500 rounded-full animate-pulse" />
                                    {/* Traveling Signal */}
                                    <div className="absolute left-1/2 top-1/2 h-3 w-3 bg-purple-300 rounded-full animate-flow-signal" />
                                </div>
                                <span className="text-gray-300 text-sm">Message Queued</span>
                            </div>

                            {/* Flow Line 1 */}
                            <div className="relative h-10 flex justify-start">
                                <div className="absolute left-[6.9px] top-0 bottom-0 w-[2px] bg-white/15 rounded-full" />
                                {/* Flow Light */}
                                <div className="absolute left-[4px] h-2 w-2 bg-purple-400 rounded-full animate-flow-down" />
                            </div>

                            {/* Node 2 */}
                            <div className="relative flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-4 w-4 bg-blue-400 rounded-full animate-pulse" />
                                    <div className="absolute left-1/2 top-1/2 h-3 w-3 bg-blue-200 rounded-full animate-flow-signal" />
                                </div>
                                <span className="text-gray-300 text-sm">SMTP Dispatch Initiated</span>
                            </div>

                            {/* Flow Line 2 */}
                            <div className="relative h-10 flex justify-start">
                                <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-white/15 rounded-full" />
                                <div className="absolute left-[4px] h-2 w-2 bg-blue-300 rounded-full animate-flow-down" />
                            </div>

                            {/* Node 3 */}
                            <div className="relative flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-4 w-4 bg-emerald-400 rounded-full animate-pulse" />
                                    <div className="absolute left-1/2 top-1/2 h-3 w-3 bg-emerald-200 rounded-full animate-flow-signal" />
                                </div>
                                <span className="text-gray-300 text-sm">Delivery Event Logged</span>
                            </div>

                        </div>

                        <div className="mt-4 text-xs text-gray-400">
                            Updated <span className="text-purple-400 font-medium">2s ago</span>
                        </div>
                    </div>

                </div>
                <div
                    className="
    
    w-full
    bg-black/35 backdrop-blur-2xl
    rounded-sm
    p-6
    border border-white/10
    shadow-[0_0_50px_rgba(0,0,0,0.45)]
    pointer-events-none
  "
                >
                    <h3 className="text-white font-semibold text-lg">
                        PostDepot Deliverability Intelligence
                    </h3>

                    <p className="text-gray-300 text-sm leading-relaxed mt-1 mb-4">
                        System-level insights providing full visibility into inbox placement, provider performance, domain reputation, and delivery throughput — updated in real time.
                    </p>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <div className="text-white font-bold text-xl">95%+</div>
                            <div className="text-gray-400 text-xs">Inbox Placement Rate</div>
                        </div>

                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <div className="text-white font-bold text-xl">18</div>
                            <div className="text-gray-400 text-xs">Active Sending Domains</div>
                        </div>

                        <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                            <div className="text-white font-bold text-xl">600k+</div>
                            <div className="text-gray-400 text-xs">Emails Dispatched Daily</div>
                        </div>
                    </div>

                    {/* Bottom Glow Divider */}
                    <div className="mt-5 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                    {/* Bottom mini-text */}
                    <p className="text-gray-400 text-xs mt-3">
                        Engineered for platforms, SaaS products, financial systems, and enterprises where email reliability is non-negotiable.
                    </p>
                </div>
            </div>
        </div>

    )
}

export default VideoComponent