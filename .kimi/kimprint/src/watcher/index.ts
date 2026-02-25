/**
 * kimprint Watcher Actor
 * 
 * Actor pattern for session file monitoring.
 * Same pattern as DbActor in foundframe - command enum + channel-based.
 */

import type { WatcherCommand } from "../types.js";

/**
 * WatcherActor: Dedicated thread for file monitoring.
 * Processes commands sequentially, provides natural backpressure.
 */
export class WatcherActor {
  private running = false;
  private commandQueue: WatcherCommand[] = [];
  
  /* TODO Phase 5: Add chokidar watcher instance */
  /* TODO Phase 5: Add reference to storage for packet generation */
  
  /**
   * Start the actor processing loop.
   */
  async run(): Promise<void> {
    this.running = true;
    
    console.error("kimprint: WatcherActor started");
    
    while (this.running) {
      /* Process commands from queue */
      if (this.commandQueue.length > 0) {
        const cmd = this.commandQueue.shift();
        if (cmd) {
          await this.handleCommand(cmd);
        }
      }
      
      /* Small delay to prevent CPU spinning */
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.error("kimprint: WatcherActor stopped");
  }
  
  /**
   * Handle a single command.
   */
  private async handleCommand(cmd: WatcherCommand): Promise<void> {
    switch (cmd.type) {
      case "StartMonitoring":
        /* TODO Phase 5: Start chokidar watching at cmd.path */
        console.error(`kimprint: Start monitoring ${cmd.path}`);
        break;
        
      case "StopMonitoring":
        /* TODO Phase 5: Stop all watchers */
        this.running = false;
        break;
        
      case "GeneratePacket":
        /* TODO Phase 5: Trigger packet generation with cmd.trigger */
        console.error(`kimprint: Generate packet - ${cmd.trigger}`);
        break;
        
      case "SessionUpdate":
        /* TODO Phase 5: Process session file updates */
        console.error(`kimprint: Session update - ${cmd.files.length} files`);
        break;
    }
  }
  
  /**
   * Send command to actor (async, non-blocking).
   */
  sendCommand(cmd: WatcherCommand): void {
    this.commandQueue.push(cmd);
  }
  
  /**
   * Stop the actor gracefully.
   */
  stop(): void {
    this.sendCommand({ type: "StopMonitoring" });
  }
}

/**
 * WatcherHandle: Interface for external code to communicate with actor.
 */
export class WatcherHandle {
  private actor: WatcherActor;
  
  constructor() {
    this.actor = new WatcherActor();
  }
  
  /**
   * Start watching a directory.
   */
  startMonitoring(path: string): void {
    this.actor.sendCommand({ type: "StartMonitoring", path });
  }
  
  /**
   * Request packet generation.
   */
  generatePacket(trigger: string): void {
    this.actor.sendCommand({ type: "GeneratePacket", trigger });
  }
  
  /**
   * Start the actor thread.
   */
  async start(): Promise<void> {
    /* TODO Phase 5: Run in actual worker thread */
    this.actor.run();
  }
  
  /**
   * Stop the actor.
   */
  stop(): void {
    this.actor.stop();
  }
}
