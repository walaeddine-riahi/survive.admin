import type { LabCommand, LabContext, CommandOutput, OutputLine } from "./scenarios";
import { formatTable, ts } from "./scenarios";

// ─── Helper ───────────────────────────────────────────────────────────────────
function out(lines: OutputLine[], revealIOC?: string[], scorePoints?: number): CommandOutput {
  return { lines, revealIOC, scorePoints };
}
function line(text: string, color: OutputLine["color"] = "white", bold = false): OutputLine {
  return { text, color, bold };
}
function red(t: string) { return line(t, "red"); }
function green(t: string) { return line(t, "green"); }
function yellow(t: string) { return line(t, "yellow"); }
function cyan(t: string, bold = false) { return line(t, "cyan", bold); }
function gray(t: string) { return line(t, "gray"); }

// ═══════════════════════════════════════════════════════════════════════════════
// IT/SOC COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

export const IT_COMMANDS: LabCommand[] = [

  // ── Network investigation ──────────────────────────────────────────────────
  {
    cmd: "netstat -an",
    aliases: ["netstat -tunp", "netstat -tulpn", "ss -tulpn", "ss -an"],
    description: "Affiche les connexions réseau actives",
    category: "network",
    hint: "netstat -an | grep ESTABLISHED",
    outputFn: (_args, ctx) => {
      const conns = ctx.scenarioData.networkConnections || [];
      const lines: OutputLine[] = [
        cyan("Active Internet connections (servers and established)", true),
        cyan("Proto  Local Address            Foreign Address         State        PID/Program"),
        gray("─────────────────────────────────────────────────────────────────────────────"),
      ];
      conns.forEach(c => {
        const suspicious = c.isSuspicious;
        lines.push({
          text: `tcp    ${c.localAddr}:${c.localPort.toString().padEnd(5)}    ${c.remoteAddr}:${c.remotePort.toString().padEnd(6)}   ${c.state.padEnd(12)} ${c.pid}/${c.process}`,
          color: suspicious ? "red" : "white",
          bold: suspicious,
        });
      });
      lines.push(gray(""));
      const suspicious = conns.filter(c => c.isSuspicious);
      if (suspicious.length > 0) {
        lines.push(red(`⚠  ${suspicious.length} connexion(s) suspecte(s) détectée(s) — vérifiez les IPs distantes`));
      }
      const revealedIOCs = conns.filter(c => c.isSuspicious).flatMap(() => ["ioc-01"]);
      return out(lines, [...new Set(revealedIOCs)], 10);
    },
  },

  {
    cmd: "nmap -sV",
    aliases: ["nmap -sV -O", "nmap -p-", "nmap -A"],
    description: "Scan réseau — découverte d'hôtes et services",
    category: "network",
    hint: "nmap -sV 192.168.1.0/24",
    outputFn: (_args, ctx) => {
      const hosts = ctx.scenarioData.hosts || [];
      const lines: OutputLine[] = [
        cyan(`Starting Nmap 7.94 scan at ${ts()}`, true),
        gray("Nmap scan report for subnet 192.168.1.0/24"),
        gray(""),
      ];
      hosts.forEach(h => {
        lines.push(line(""));
        lines.push({ text: `Nmap scan report for ${h.hostname} (${h.ip})`, color: h.isCompromised ? "red" : "green", bold: true });
        lines.push(line(`Host is up (0.00${Math.floor(Math.random() * 9)}s latency)`));
        lines.push(line("PORT       STATE  SERVICE        VERSION"));
        h.openPorts.forEach((p, i) => {
          lines.push(line(`${p.toString().padEnd(5)}/tcp  open   ${(h.services[i] || "unknown").padEnd(14)} [version simulée]`));
        });
        lines.push(line(`OS: ${h.os}`));
        if (h.isCompromised) {
          lines.push(red(`⚠  RISK: ${h.riskLevel.toUpperCase()} — cet hôte présente des indicateurs de compromission`));
        }
      });
      lines.push(gray(""));
      lines.push(green(`${hosts.length} hosts up — ${hosts.filter(h => h.isCompromised).length} compromis détectés`));
      return out(lines, [], 5);
    },
  },

  {
    cmd: "ps aux",
    aliases: ["ps -ef", "Get-Process", "tasklist", "ps -auxf"],
    description: "Liste les processus en cours",
    category: "process",
    hint: "ps aux | grep -i suspicious",
    outputFn: (_args, ctx) => {
      const procs = ctx.scenarioData.processes || [];
      const lines: OutputLine[] = [
        cyan("USER         PID  %CPU  %MEM  COMMAND", true),
        gray("─────────────────────────────────────────────────────────────────────"),
      ];
      procs.forEach(p => {
        lines.push({
          text: `${p.user.padEnd(12)} ${p.pid.toString().padEnd(5)} ${p.cpu.toFixed(1).padEnd(5)} ${p.mem.toFixed(1).padEnd(6)} ${p.cmdline}`,
          color: p.isMalicious ? "red" : "white",
          bold: p.isMalicious,
        });
      });
      const malicious = procs.filter(p => p.isMalicious);
      if (malicious.length > 0) {
        lines.push(gray(""));
        lines.push(red(`⚠  ${malicious.length} processus suspect(s): ${malicious.map(p => p.name).join(", ")}`));
        lines.push(yellow("  → Vérifiez les commandes complètes et les PIDs parents"));
      }
      const revealedIOCs = malicious.map(() => "ioc-03");
      return out(lines, [...new Set(revealedIOCs)], 15);
    },
  },

  {
    cmd: "last",
    aliases: ["lastlog", "who", "w", "finger"],
    description: "Historique des connexions utilisateurs",
    category: "auth",
    hint: "last | head -20",
    outputFn: (_args, ctx) => {
      const lines: OutputLine[] = [
        cyan("USERNAME    TTY         FROM              LATEST"),
        gray("─────────────────────────────────────────────────────────────────────────────"),
        line("admin       pts/0       192.168.1.200     Mon Nov 18 08:12:43 2024"),
        line("operator    pts/1       192.168.1.50      Mon Nov 18 07:55:01 2024"),
        { text: "svc_backup  pts/2       94.102.49.190     Mon Nov 18 02:17:43 2024   ← EXTERNAL IP", color: "red", bold: true },
        line("john.doe    pts/0       192.168.1.12      Fri Nov 15 17:44:22 2024"),
        line("jane.smith  pts/1       192.168.1.14      Fri Nov 15 17:31:09 2024"),
        gray(""),
        { text: "wtmp begins Thu Nov 14 07:00:01 2024", color: "gray" },
      ];
      lines.push(gray(""));
      lines.push(red("⚠  Connexion suspecte: svc_backup depuis IP externe 94.102.49.190 (Netherlands)"));
      lines.push(yellow("  → Ce compte est normalement utilisé localement uniquement"));
      return out(lines, ["ioc-04"], 10);
    },
  },

  {
    cmd: "grep",
    aliases: ["grep -r", "grep -i", "grep -E"],
    description: "Recherche dans les fichiers/logs",
    category: "forensic",
    hint: "grep 'svc_backup' /var/log/auth.log",
    outputFn: (args, ctx) => {
      const query = args.join(" ");
      const logs = ctx.scenarioData.logEntries || [];
      const matching = logs.filter(l =>
        l.message.toLowerCase().includes(query.replace(/['"]/g, "").toLowerCase()) ||
        (l.user || "").includes(query.replace(/['"]/g, ""))
      );
      if (matching.length === 0) {
        return out([line(`(no output)`, "gray")]);
      }
      const lines: OutputLine[] = [];
      matching.forEach(l => {
        lines.push({
          text: `${l.timestamp} [${l.level}] ${l.source}: ${l.message}`,
          color: l.level === "CRITICAL" ? "red" : l.level === "WARNING" ? "yellow" : "white",
          bold: l.isIOC,
        });
      });
      const revealedIOCs = matching.filter(l => l.isIOC).map(l => l.iocId!).filter(Boolean);
      return out(lines, revealedIOCs, revealedIOCs.length * 10);
    },
  },

  {
    cmd: "cat /var/log/auth.log",
    aliases: ["tail -f /var/log/auth.log", "less /var/log/syslog", "Get-EventLog", "eventvwr"],
    description: "Lit les logs d'authentification",
    category: "forensic",
    hint: "cat /var/log/auth.log | grep -i 'fail\\|error\\|invalid'",
    outputFn: (_args, ctx) => {
      const logs = (ctx.scenarioData.logEntries || []).filter(l =>
        l.source.includes("SSH") || l.source.includes("auth") || l.source.includes("Active Directory")
      );
      const lines: OutputLine[] = [cyan("=== /var/log/auth.log ===", true)];
      logs.forEach(l => {
        lines.push({
          text: `${l.timestamp} ${l.host || "localhost"} ${l.source}[${Math.floor(Math.random() * 9000) + 1000}]: ${l.message}`,
          color: l.level === "CRITICAL" ? "red" : l.level === "WARNING" ? "yellow" : "gray",
          bold: l.isIOC,
        });
      });
      const revealedIOCs = logs.filter(l => l.isIOC).map(l => l.iocId!).filter(Boolean);
      return out(lines, revealedIOCs, revealedIOCs.length * 8);
    },
  },

  {
    cmd: "find",
    aliases: ["find / -name", "find / -newer", "find / -size"],
    description: "Recherche de fichiers suspects",
    category: "forensic",
    hint: "find /tmp -type f -newer /etc/passwd",
    outputFn: (args, ctx) => {
      const lines: OutputLine[] = [];
      const hasLocked = args.some(a => a.includes("locked") || a.includes("exe") || a.includes("newer"));
      if (hasLocked || args.length === 0) {
        lines.push(gray(`find: searching...`));
        lines.push(line("/tmp/svc_update.exe", "red"));
        lines.push(line("/tmp/.hidden_b8e2f1a4", "red"));
        lines.push(line("/Users/Public/!!!READ_ME_LOCKBIT!!!.txt", "red"));
        lines.push(line("/Windows/Temp/a3f2c4e8.dll", "red"));
        lines.push(gray("... (output truncated)"));
        lines.push(gray(""));
        lines.push(red("⚠  Fichiers suspects trouvés — vérifiez les hashs avec sha256sum"));
        return out(lines, ["ioc-02", "ioc-07"], 20);
      }
      lines.push(gray("(no results matching criteria)"));
      return out(lines);
    },
  },

  {
    cmd: "sha256sum",
    aliases: ["md5sum", "Get-FileHash", "certutil -hashfile"],
    description: "Calcule le hash d'un fichier",
    category: "forensic",
    hint: "sha256sum /tmp/svc_update.exe",
    outputFn: (args) => {
      const file = args[0] || "/tmp/unknown";
      if (file.includes("svc_update") || file.includes("a3f2c4e8")) {
        return out([
          { text: `a3f2c4e8d1b7f3a9c2d5e8f1b4a7d2e5  ${file}`, color: "white" },
          gray(""),
          { text: "🔴 IOC DÉTECTÉ — Ce hash correspond à LockBit 3.0 (VirusTotal: 67/72)", color: "red", bold: true },
          yellow("  Source: VT, MalwareBazaar, ANSSI TLP:WHITE feed"),
        ], ["ioc-02"], 25);
      }
      return out([line(`${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("")}  ${file}`)]);
    },
  },

  {
    cmd: "nslookup",
    aliases: ["dig", "host", "Resolve-DnsName", "Get-DnsClientCache"],
    description: "Résolution DNS et investigation",
    category: "network",
    hint: "nslookup update-ms-cdn.com",
    outputFn: (args) => {
      const domain = args[0] || "unknown.com";
      if (domain.includes("update-ms-cdn") || domain.includes("c2")) {
        return out([
          gray(`Server: 8.8.8.8`),
          gray(`Address: 8.8.8.8#53`),
          line(""),
          line(`Name: ${domain}`),
          { text: `Address: 185.220.101.47`, color: "red", bold: true },
          line(""),
          { text: "⚠  IOC DÉTECTÉ — Domaine enregistré il y a 3 jours (DGA probable)", color: "red", bold: true },
          yellow("  Catégorie VirusTotal: Malware C2 infrastructure"),
          yellow("  Signalé par: Cisco Talos, ANSSI, abuse.ch"),
        ], ["ioc-01", "ioc-05"], 20);
      }
      return out([
        gray(`Server: 8.8.8.8`),
        gray(`Address: 8.8.8.8#53`),
        line(`Name: ${domain}`),
        line(`Address: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`),
      ]);
    },
  },

  // ── Mitigation commands ────────────────────────────────────────────────────
  {
    cmd: "block-ip",
    aliases: ["iptables -A INPUT -s", "New-NetFirewallRule", "firewall-cmd --add-rich-rule"],
    description: "Bloque une IP suspecte en firewall",
    category: "mitigation",
    hint: "block-ip 185.220.101.47",
    outputFn: (args) => {
      const ip = args[0];
      if (!ip) return out([red("Usage: block-ip <ip_address>")], [], 0);
      const isKnownBad = ["185.220.101.47", "94.102.49.190", "45.147.229.85"].includes(ip);
      return out([
        green(`[OK] Firewall rule added: DROP all traffic from ${ip}`),
        green(`[OK] Rule propagated to: FW-CORE-01, FW-DMZ-01`),
        line(`[LOG] Action logged — reference: FW-RULE-${Date.now().toString().slice(-6)}`),
        ...(isKnownBad ? [
          { text: `✓ Bonne décision — ${ip} est un C2 connu (LockBit)`, color: "green" as const, bold: true },
        ] : [
          yellow(`ℹ  IP ${ip} bloquée — non classifiée comme malveillante`),
        ]),
      ], [], isKnownBad ? 20 : 5);
    },
  },

  {
    cmd: "isolate-host",
    aliases: ["netsh advfirewall", "quarantine", "endpoint-isolate"],
    description: "Isole un hôte du réseau (quarantaine)",
    category: "mitigation",
    hint: "isolate-host SRV-FILES-01",
    outputFn: (args) => {
      const host = args[0];
      if (!host) return out([red("Usage: isolate-host <hostname>")]);
      const isKnownCompromised = ["SRV-FILES-01", "SRV-FILES-02", "SRV-ERP-PROD", "WKS-FINANCE-01"].some(
        h => host.toUpperCase().includes(h.split(".")[0])
      );
      return out([
        yellow(`[ACTION] Isolating host: ${host}...`),
        green(`[OK] Network access revoked for ${host}`),
        green(`[OK] EDR quarantine mode activated`),
        green(`[OK] Host accessible for investigation via out-of-band management only`),
        line(`[LOG] Isolation recorded — ref: ISO-${Date.now().toString().slice(-6)}`),
        ...(isKnownCompromised ? [
          { text: `✓ Correct — ${host} était compromis et propageait le ransomware`, color: "green" as const, bold: true },
        ] : [
          yellow(`ℹ  Hôte isolé — vérifiez que c'est bien le bon avant l'action`),
        ]),
      ], [], isKnownCompromised ? 30 : 5);
    },
  },

  {
    cmd: "kill-process",
    aliases: ["kill -9", "Stop-Process", "taskkill /F /PID"],
    description: "Termine un processus malveillant",
    category: "mitigation",
    hint: "kill-process 4821",
    outputFn: (args) => {
      const pid = parseInt(args[0]);
      const isMalicious = [4821, 4822, 5001].includes(pid);
      if (!pid) return out([red("Usage: kill-process <PID>")]);
      return out([
        green(`[OK] Process ${pid} terminated (SIGKILL)`),
        green(`[OK] Process tree terminated`),
        ...(isMalicious ? [
          { text: `✓ Processus malveillant arrêté — PID ${pid} était le dropper LockBit`, color: "green" as const, bold: true },
          yellow("  ⚠  Note: Le malware peut avoir des mécanismes de persistance — vérifiez le registre"),
        ] : [
          yellow(`ℹ  Processus ${pid} terminé`),
        ]),
      ], [], isMalicious ? 20 : 0);
    },
  },

  {
    cmd: "Get-ItemProperty HKLM:",
    aliases: ["reg query", "regedit", "Get-Item HKLM"],
    description: "Inspecte les clés de registre Windows",
    category: "forensic",
    hint: "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    outputFn: (args) => {
      if (args.join(" ").includes("CurrentVersion\\Run") || args.join(" ").includes("Run")) {
        return out([
          cyan("HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", true),
          line(""),
          line("    OneDriveSetup         REG_SZ    C:\\Windows\\System32\\OneDriveSetup.exe /thfirstsetup"),
          line("    SecurityHealthSystray REG_SZ    %windir%\\system32\\SecurityHealthSystray.exe"),
          { text: "    WinUpdate             REG_SZ    C:\\Windows\\Temp\\svc_update.exe -silent    ← MALVEILLANT", color: "red", bold: true },
          line("    MicrosoftEdgeAutoLaunch REG_SZ C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe --no-startup-window"),
          line(""),
          { text: "⚠  IOC DÉTECTÉ — Clé de persistance malveillante: WinUpdate → svc_update.exe", color: "red", bold: true },
          yellow("  Action: reg delete HKLM\\...\\Run /v WinUpdate /f"),
        ], ["ioc-06"], 25);
      }
      return out([cyan("(empty or no matching keys)")]);
    },
  },

  {
    cmd: "tcpdump",
    aliases: ["wireshark", "tshark", "capture-traffic"],
    description: "Capture et analyse le trafic réseau",
    category: "network",
    hint: "tcpdump -i eth0 -n host 185.220.101.47",
    outputFn: (args) => {
      const filterIP = args.find(a => a.match(/\d+\.\d+\.\d+\.\d+/));
      const lines: OutputLine[] = [
        cyan(`tcpdump: listening on eth0, link-type EN10MB (Ethernet)`, true),
        gray(""),
      ];
      if (!filterIP || filterIP.includes("185.220")) {
        lines.push({ text: `${ts()} IP 192.168.1.100.49782 > 185.220.101.47.443: Flags [P.], seq 1:847, length 846`, color: "red" });
        lines.push({ text: `${ts()} IP 192.168.1.10.49901 > 185.220.101.47.443: Flags [P.], seq 1:1243, length 1242`, color: "red" });
        lines.push({ text: `${ts()} IP 185.220.101.47.443 > 192.168.1.100.49782: Flags [.], seq 1:1, ack 847, length 0`, color: "red" });
        lines.push(gray(`${ts()} IP 192.168.1.20.1433 > 192.168.1.100.51203: Flags [P.], seq 1:4096, length 4095`));
        lines.push(gray("..."));
        lines.push(gray(""));
        lines.push(red("⚠  Trafic C2 actif confirmé — 185.220.101.47 (TLS, port 443)"));
        lines.push(yellow("  Suspicion: exfiltration chiffrée en cours"));
        return out(lines, ["ioc-01"], 15);
      }
      lines.push(gray("(no packets matching filter)"));
      return out(lines);
    },
  },

  {
    cmd: "help",
    aliases: ["?", "man", "--help"],
    description: "Affiche les commandes disponibles",
    category: "forensic",
    outputFn: () => out([
      cyan("=== Commandes disponibles — Mode IT/SOC ===", true),
      gray(""),
      cyan("RÉSEAU"),
      line("  netstat -an          Connexions actives"),
      line("  nmap -sV <subnet>    Scan réseau"),
      line("  tcpdump -i eth0      Capture trafic"),
      line("  nslookup <domain>    Résolution DNS"),
      cyan("PROCESSUS"),
      line("  ps aux               Liste processus"),
      line("  kill-process <PID>   Terminer un processus"),
      cyan("FORENSIQUE"),
      line("  grep <pattern> <log> Recherche dans logs"),
      line("  find / -name <file>  Recherche de fichiers"),
      line("  sha256sum <file>     Hash de fichier"),
      line("  cat /var/log/auth.log Logs d'authentification"),
      line("  last                 Historique connexions"),
      line("  Get-ItemProperty HKLM: Registre Windows"),
      cyan("MITIGATION"),
      line("  block-ip <ip>        Bloquer une IP"),
      line("  isolate-host <host>  Mettre en quarantaine"),
      line("  kill-process <PID>   Arrêter un processus"),
      gray(""),
      yellow("Conseil: commencez par 'netstat -an' et 'ps aux' pour une vue d'ensemble"),
    ]),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OT/SCADA COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

export const OT_COMMANDS: LabCommand[] = [

  {
    cmd: "plc status",
    aliases: ["plc list", "ot-scan", "plc-status"],
    description: "Affiche l'état de tous les automates",
    category: "ot",
    hint: "plc status",
    outputFn: (_args, ctx) => {
      const devices = ctx.scenarioData.plcDevices || [];
      const lines: OutputLine[] = [
        cyan("=== OT Device Status Board ===", true),
        cyan(`PLC-ID          HOSTNAME         IP             TYPE               STATUS     LAST_UPDATE`),
        gray("─────────────────────────────────────────────────────────────────────────────────────"),
      ];
      devices.forEach(d => {
        const statusColor: OutputLine["color"] = d.status === "online" ? "green" : d.status === "warning" ? "yellow" : d.status === "fault" || d.status === "compromised" ? "red" : "gray";
        lines.push({
          text: `${d.id.padEnd(16)} ${d.name.padEnd(17)} ${d.ip.padEnd(15)} ${d.type.padEnd(20)} ${d.status.toUpperCase().padEnd(11)} ${d.lastUpdate}`,
          color: statusColor,
          bold: d.status === "fault" || d.status === "compromised",
        });
      });
      lines.push(gray(""));
      const anomalies = devices.filter(d => d.status !== "online");
      if (anomalies.length > 0) {
        lines.push(red(`⚠  ${anomalies.length} automate(s) en état anormal — investigation requise`));
        lines.push(yellow("  → Utilisez 'plc read <PLC-ID>' pour inspecter les registres"));
      }
      return out(lines, [], 5);
    },
  },

  {
    cmd: "plc read",
    aliases: ["modbus read", "plc-read", "read-register"],
    description: "Lit les registres d'un automate",
    category: "ot",
    hint: "plc read PLC-CHAINE-B HR 40001",
    outputFn: (args, ctx) => {
      const plcId = args[0] || "";
      const devices = ctx.scenarioData.plcDevices || [];
      const device = devices.find(d => d.id.toLowerCase() === plcId.toLowerCase() || d.ip === plcId);
      if (!device) {
        return out([red(`Erreur: PLC '${plcId}' introuvable. Utilisez 'plc status' pour lister les PLCs.`)]);
      }
      const lines: OutputLine[] = [
        cyan(`=== ${device.name} (${device.ip}) — ${device.type} ===`, true),
        cyan(`ADDR    NAME                     VALUE      UNIT       STATUS`),
        gray("─────────────────────────────────────────────────────────────────"),
      ];
      device.registers.forEach(r => {
        const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
        const statusColor: OutputLine["color"] = r.isAnomaly ? "red" : pct > 85 ? "yellow" : "green";
        lines.push({
          text: `${r.address.toString().padEnd(8)} ${r.name.padEnd(25)} ${r.value.toString().padEnd(11)} ${r.unit.padEnd(11)} ${r.isAnomaly ? "⚠ ANOMALIE" : "OK"}${r.isAnomaly && r.expectedValue !== undefined ? ` (attendu: ${r.expectedValue})` : ""}`,
          color: statusColor,
          bold: r.isAnomaly,
        });
      });
      const anomalies = device.registers.filter(r => r.isAnomaly);
      if (anomalies.length > 0) {
        lines.push(gray(""));
        lines.push(red(`⚠  ${anomalies.length} registre(s) hors limites — risque physique potentiel`));
        if (device.id === "PLC-CHAINE-B") {
          lines.push(yellow("  → Vitesse convoyeur 2847 tr/min: DANGER IMMÉDIAT (max autorisé: 1500)"));
          lines.push(yellow("  → Température moteur 94°C: risque d'incendie (seuil arrêt: 90°C)"));
        }
      }
      const revealedIOCs = anomalies.length > 0 ? ["ot-ioc-03"] : [];
      return out(lines, revealedIOCs, anomalies.length * 15);
    },
  },

  {
    cmd: "plc write",
    aliases: ["modbus write", "write-register", "set-register"],
    description: "Écrit une valeur dans un registre PLC",
    category: "ot",
    hint: "plc write PLC-CHAINE-B HR 40001 1200",
    outputFn: (args) => {
      const plcId = args[0];
      const value = args[3];
      if (!plcId || !value) return out([red("Usage: plc write <PLC-ID> HR <address> <value>")]);
      const isCorrectValue = value === "1200" || value === "0";
      return out([
        yellow(`[ACTION] Writing to ${plcId} register ${args[2] || "?"}: ${value}`),
        ...(isCorrectValue ? [
          green(`[OK] Write successful — Register updated`),
          green(`[OK] Value confirmed: ${value} (within safe limits)`),
          { text: "✓ Bonne action — valeur de sécurité appliquée", color: "green" as const, bold: true },
        ] : [
          green(`[OK] Write successful — Register updated`),
          yellow(`ℹ  Valeur ${value} appliquée — vérifiez les limites opérationnelles`),
        ]),
        line(`[LOG] OT action logged — operator accountability record`),
      ], [], isCorrectValue ? 20 : 5);
    },
  },

  {
    cmd: "plc audit-log",
    aliases: ["ot-auditlog", "historian", "plc-log"],
    description: "Affiche le journal des actions sur les PLCs",
    category: "ot",
    hint: "plc audit-log --last 24h",
    outputFn: (_args, ctx) => {
      const events = ctx.scenarioData.otEvents || [];
      const lines: OutputLine[] = [
        cyan("=== OT Audit Log — last 24h ===", true),
        gray(""),
      ];
      events.forEach(e => {
        const color: OutputLine["color"] = e.severity === "critical" ? "red" : e.severity === "alarm" ? "red" : e.severity === "warning" ? "yellow" : "gray";
        lines.push({
          text: `[${e.timestamp}] [${e.severity.toUpperCase()}] ${e.source}: ${e.message}`,
          color,
          bold: e.isAnomaly && e.severity === "critical",
        });
      });
      lines.push(gray(""));
      const anomalies = events.filter(e => e.isAnomaly);
      if (anomalies.length > 0) {
        lines.push(red(`⚠  ${anomalies.length} événement(s) anormal(aux) détecté(s)`));
        lines.push(yellow("  → Accès non autorisé depuis maint_ext_003 à 03h17"));
      }
      return out(lines, ["ot-ioc-01", "ot-ioc-04"], 20);
    },
  },

  {
    cmd: "emergency-stop",
    aliases: ["plc stop", "ot-estop", "shutdown-chain"],
    description: "Arrêt d'urgence d'une ligne de production",
    category: "mitigation",
    hint: "emergency-stop PLC-CHAINE-B",
    outputFn: (args) => {
      const target = args[0] || "ALL";
      return out([
        { text: `⚡ EMERGENCY STOP — ${target}`, color: "red", bold: true },
        red("[ACTION] Sending STOP command to all actuators..."),
        green("[OK] Convoyeur arrêté"),
        green("[OK] Vérins hydrauliques retractés"),
        green("[OK] Alimentation moteurs coupée"),
        green("[OK] Sécurités mécaniques engagées"),
        { text: `[SAFE] Chaîne ${target} en état sécurisé — redémarrage manuel requis`, color: "green", bold: true },
        line(`[LOG] Emergency stop logged — ref: ESTOP-${Date.now().toString().slice(-6)}`),
        gray(""),
        yellow("ℹ  Prochain step: isoler le réseau OT et analyser les registres modifiés"),
      ], [], 30);
    },
  },

  {
    cmd: "ot-scan",
    aliases: ["ot-discover", "plc-discover", "nmap-ot"],
    description: "Découverte des équipements OT sur le réseau",
    category: "network",
    hint: "ot-scan 10.0.10.0/24",
    outputFn: (_args, ctx) => {
      const devices = ctx.scenarioData.plcDevices || [];
      const lines: OutputLine[] = [
        cyan("=== OT Network Discovery — Modbus/S7/DNP3 scan ===", true),
        gray("Scanning 10.0.10.0/24 for industrial devices..."),
        gray(""),
      ];
      devices.forEach(d => {
        lines.push(line(`Found: ${d.ip} — ${d.type} (${d.name})`));
      });
      lines.push({ text: "Found: 10.0.10.47 — UNKNOWN DEVICE (not in asset inventory!)", color: "red", bold: true });
      lines.push(gray(""));
      lines.push(red("⚠  Équipement non répertorié sur le réseau OT: 10.0.10.47"));
      lines.push(yellow("  → Possible équipement intrus ou laptop de maintenance non autorisé"));
      return out(lines, ["ot-ioc-01"], 25);
    },
  },

  {
    cmd: "help",
    aliases: ["?", "--help"],
    description: "Commandes disponibles en mode OT/SCADA",
    category: "ot",
    outputFn: () => out([
      cyan("=== Commandes disponibles — Mode OT/SCADA ===", true),
      gray(""),
      cyan("SUPERVISION"),
      line("  plc status                     État de tous les automates"),
      line("  plc read <PLC-ID>              Lire les registres d'un PLC"),
      line("  ot-scan                        Découverte réseau OT"),
      line("  plc audit-log                  Journal des actions"),
      cyan("ACTIONS"),
      line("  plc write <ID> HR <addr> <val> Écrire dans un registre"),
      line("  emergency-stop <ID>            Arrêt d'urgence"),
      cyan("INVESTIGATION"),
      line("  netstat -an                    Connexions réseau"),
      line("  last                           Accès récents"),
      gray(""),
      yellow("Conseil: commencez par 'plc status' puis 'plc audit-log'"),
    ]),
  },
];

// ─── Unified command resolver ──────────────────────────────────────────────────
export function resolveCommand(input: string, mode: string): LabCommand | null {
  const commands = mode === "ot_scada" ? OT_COMMANDS : IT_COMMANDS;
  const trimmed = input.trim().toLowerCase();

  for (const cmd of commands) {
    if (trimmed.startsWith(cmd.cmd.toLowerCase())) return cmd;
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        if (trimmed.startsWith(alias.toLowerCase())) return cmd;
      }
    }
  }
  return null;
}

export function getCommandSuggestions(partial: string, mode: string): string[] {
  const commands = mode === "ot_scada" ? OT_COMMANDS : IT_COMMANDS;
  const lower = partial.toLowerCase();
  return commands
    .filter(c => c.cmd.toLowerCase().startsWith(lower) || c.aliases?.some(a => a.toLowerCase().startsWith(lower)))
    .map(c => c.hint || c.cmd)
    .slice(0, 5);
}
