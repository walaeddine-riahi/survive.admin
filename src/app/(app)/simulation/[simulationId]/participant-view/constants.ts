export const cybergTheme = {
  colors: {
    primary: {
      DEFAULT: "#7C3AED",
      light: "#A78BFA",
      dark: "#4C1D95",
      hover: "#9333EA",
    },
    secondary: {
      DEFAULT: "#22D3EE",
      light: "#BAE6FD",
      dark: "#0EA5E9",
    },
    background: {
      DEFAULT: "#0B0F1F",
      light: "#121827",
      muted: "#1E293B",
    },
    text: {
      primary: "#E0E7FF",
      secondary: "#C4B5FD",
      muted: "#A78BFA",
    },
    border: {
      DEFAULT: "#3F3F46",
      hover: "#5B21B6",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  borderRadius: {
    sm: "0.25rem",
    DEFAULT: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "Non définie";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Date invalide";
  }
};

export const participantLogo = "/media/images/logo%20mauve%20%2B%20fst%20%281%29.png";

export const getChannelGradient = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email": return "from-red-500 to-red-600";
    case "sms": return "from-green-500 to-green-600";
    case "call": return "from-purple-500 to-purple-600";
    case "alert": return "from-amber-500 to-amber-600";
    case "memo": return "from-indigo-500 to-indigo-600";
    case "newsbroadcast": return "from-pink-500 to-pink-600";
    case "newspaper": return "from-rose-500 to-rose-600";
    case "social": return "from-teal-500 to-teal-600";
    case "report": return "from-cyan-500 to-fuchsia-500";
    default: return "from-gray-500 to-gray-600";
  }
};

export const getInjectionGradient = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email": return "from-blue-500 to-blue-600";
    case "sms": return "from-green-500 to-green-600";
    case "call": return "from-purple-500 to-purple-600";
    case "alert": return "from-amber-500 to-amber-600";
    case "memo": return "from-indigo-500 to-indigo-600";
    case "newsbroadcast": return "from-pink-500 to-pink-600";
    case "newspaper": return "from-rose-500 to-rose-600";
    case "social": return "from-teal-500 to-teal-600";
    default: return "from-gray-500 to-gray-600";
  }
};

export const getFileType = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  return `Fichier .${extension}`;
};
