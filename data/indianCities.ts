// Indian Cities with States
export interface CityData {
  label: string;
  value: string;
  state: string;
}

export const indianCities: CityData[] = [
  // Andhra Pradesh
  { label: "Hyderabad, Andhra Pradesh", value: "hyderabad", state: "Andhra Pradesh" },
  { label: "Visakhapatnam, Andhra Pradesh", value: "visakhapatnam", state: "Andhra Pradesh" },
  { label: "Vijayawada, Andhra Pradesh", value: "vijayawada", state: "Andhra Pradesh" },
  { label: "Tirupati, Andhra Pradesh", value: "tirupati", state: "Andhra Pradesh" },

  // Arunachal Pradesh
  { label: "Itanagar, Arunachal Pradesh", value: "itanagar", state: "Arunachal Pradesh" },
  { label: "Naharlagun, Arunachal Pradesh", value: "naharlagun", state: "Arunachal Pradesh" },

  // Assam
  { label: "Guwahati, Assam", value: "guwahati", state: "Assam" },
  { label: "Silchar, Assam", value: "silchar", state: "Assam" },
  { label: "Dibruar, Assam", value: "dibrugarh", state: "Assam" },

  // Bihar
  { label: "Patna, Bihar", value: "patna", state: "Bihar" },
  { label: "Gaya, Bihar", value: "gaya", state: "Bihar" },
  { label: "Bhagalpur, Bihar", value: "bhagalpur", state: "Bihar" },
  { label: "Muzaffarpur, Bihar", value: "muzaffarpur", state: "Bihar" },

  // Chhattisgarh
  { label: "Raipur, Chhattisgarh", value: "raipur", state: "Chhattisgarh" },
  { label: "Bilaspur, Chhattisgarh", value: "bilaspur", state: "Chhattisgarh" },
  { label: "Durg, Chhattisgarh", value: "durg", state: "Chhattisgarh" },

  // Goa
  { label: "Panaji, Goa", value: "panaji", state: "Goa" },
  { label: "Vasco da Gama, Goa", value: "vasco-da-gama", state: "Goa" },

  // Gujarat
  { label: "Ahmedabad, Gujarat", value: "ahmedabad", state: "Gujarat" },
  { label: "Surat, Gujarat", value: "surat", state: "Gujarat" },
  { label: "Vadodara, Gujarat", value: "vadodara", state: "Gujarat" },
  { label: "Rajkot, Gujarat", value: "rajkot", state: "Gujarat" },
  { label: "Gandhinagar, Gujarat", value: "gandhinagar", state: "Gujarat" },

  // Haryana
  { label: "Faridabad, Haryana", value: "faridabad", state: "Haryana" },
  { label: "Gurgaon, Haryana", value: "gurgaon", state: "Haryana" },
  { label: "Hisar, Haryana", value: "hisar", state: "Haryana" },
  { label: "Rohtak, Haryana", value: "rohtak", state: "Haryana" },
  { label: "Karnal, Haryana", value: "karnal", state: "Haryana" },

  // Himachal Pradesh
  { label: "Shimla, Himachal Pradesh", value: "shimla", state: "Himachal Pradesh" },
  { label: "Mandi, Himachal Pradesh", value: "mandi", state: "Himachal Pradesh" },
  { label: "Solan, Himachal Pradesh", value: "solan", state: "Himachal Pradesh" },

  // Jharkhand
  { label: "Ranchi, Jharkhand", value: "ranchi", state: "Jharkhand" },
  { label: "Jamshedpur, Jharkhand", value: "jamshedpur", state: "Jharkhand" },
  { label: "Dhanbad, Jharkhand", value: "dhanbad", state: "Jharkhand" },
  { label: "Giridih, Jharkhand", value: "giridih", state: "Jharkhand" },

  // Karnataka
  { label: "Bangalore, Karnataka", value: "bangalore", state: "Karnataka" },
  { label: "Mysore, Karnataka", value: "mysore", state: "Karnataka" },
  { label: "Mangalore, Karnataka", value: "mangalore", state: "Karnataka" },
  { label: "Belgaum, Karnataka", value: "belgaum", state: "Karnataka" },
  { label: "Hubli, Karnataka", value: "hubli", state: "Karnataka" },
  { label: "Davangere, Karnataka", value: "davangere", state: "Karnataka" },
  { label: "Kolar, Karnataka", value: "kolar", state: "Karnataka" },

  // Kerala
  { label: "Kochi, Kerala", value: "kochi", state: "Kerala" },
  { label: "Thiruvananthapuram, Kerala", value: "thiruvananthapuram", state: "Kerala" },
  { label: "Kozhikode, Kerala", value: "kozhikode", state: "Kerala" },
  { label: "Alappuzha, Kerala", value: "alappuzha", state: "Kerala" },
  { label: "Thrissur, Kerala", value: "thrissur", state: "Kerala" },

  // Madhya Pradesh
  { label: "Indore, Madhya Pradesh", value: "indore", state: "Madhya Pradesh" },
  { label: "Bhopal, Madhya Pradesh", value: "bhopal", state: "Madhya Pradesh" },
  { label: "Gwalior, Madhya Pradesh", value: "gwalior", state: "Madhya Pradesh" },
  { label: "Jabalpur, Madhya Pradesh", value: "jabalpur", state: "Madhya Pradesh" },
  { label: "Ujjain, Madhya Pradesh", value: "ujjain", state: "Madhya Pradesh" },

  // Maharashtra
  { label: "Mumbai, Maharashtra", value: "mumbai", state: "Maharashtra" },
  { label: "Pune, Maharashtra", value: "pune", state: "Maharashtra" },
  { label: "Nagpur, Maharashtra", value: "nagpur", state: "Maharashtra" },
  { label: "Aurangabad, Maharashtra", value: "aurangabad", state: "Maharashtra" },
  { label: "Nashik, Maharashtra", value: "nashik", state: "Maharashtra" },
  { label: "Thane, Maharashtra", value: "thane", state: "Maharashtra" },
  { label: "Solapur, Maharashtra", value: "solapur", state: "Maharashtra" },
  { label: "Kolhapur, Maharashtra", value: "kolhapur", state: "Maharashtra" },

  // Manipur
  { label: "Imphal, Manipur", value: "imphal", state: "Manipur" },
  { label: "Churachandpur, Manipur", value: "churachandpur", state: "Manipur" },

  // Meghalaya
  { label: "Shillong, Meghalaya", value: "shillong", state: "Meghalaya" },

  // Mizoram
  { label: "Aizawl, Mizoram", value: "aizawl", state: "Mizoram" },

  // Nagaland
  { label: "Kohima, Nagaland", value: "kohima", state: "Nagaland" },
  { label: "Dimapur, Nagaland", value: "dimapur", state: "Nagaland" },

  // Odisha
  { label: "Bhubaneswar, Odisha", value: "bhubaneswar", state: "Odisha" },
  { label: "Rourkela, Odisha", value: "rourkela", state: "Odisha" },
  { label: "Sambalpur, Odisha", value: "sambalpur", state: "Odisha" },
  { label: "Cuttack, Odisha", value: "cuttack", state: "Odisha" },

  // Punjab
  { label: "Chandigarh, Punjab", value: "chandigarh", state: "Punjab" },
  { label: "Ludhiana, Punjab", value: "ludhiana", state: "Punjab" },
  { label: "Amritsar, Punjab", value: "amritsar", state: "Punjab" },
  { label: "Jalandhar, Punjab", value: "jalandhar", state: "Punjab" },
  { label: "Patiala, Punjab", value: "patiala", state: "Punjab" },

  // Rajasthan
  { label: "Jaipur, Rajasthan", value: "jaipur", state: "Rajasthan" },
  { label: "Jodhpur, Rajasthan", value: "jodhpur", state: "Rajasthan" },
  { label: "Udaipur, Rajasthan", value: "udaipur", state: "Rajasthan" },
  { label: "Kota, Rajasthan", value: "kota", state: "Rajasthan" },
  { label: "Bikaner, Rajasthan", value: "bikaner", state: "Rajasthan" },
  { label: "Ajmer, Rajasthan", value: "ajmer", state: "Rajasthan" },
  { label: "Alwar, Rajasthan", value: "alwar", state: "Rajasthan" },

  // Sikkim
  { label: "Gangtok, Sikkim", value: "gangtok", state: "Sikkim" },

  // Tamil Nadu
  { label: "Chennai, Tamil Nadu", value: "chennai", state: "Tamil Nadu" },
  { label: "Coimbatore, Tamil Nadu", value: "coimbatore", state: "Tamil Nadu" },
  { label: "Madurai, Tamil Nadu", value: "madurai", state: "Tamil Nadu" },
  { label: "Tiruchirappalli, Tamil Nadu", value: "tiruchirappalli", state: "Tamil Nadu" },
  { label: "Salem, Tamil Nadu", value: "salem", state: "Tamil Nadu" },
  { label: "Tiruppur, Tamil Nadu", value: "tiruppur", state: "Tamil Nadu" },
  { label: "Kanchipuram, Tamil Nadu", value: "kanchipuram", state: "Tamil Nadu" },

  // Telangana
  { label: "Hyderabad, Telangana", value: "hyderabad-telangana", state: "Telangana" },
  { label: "Warangal, Telangana", value: "warangal", state: "Telangana" },
  { label: "Nizamabad, Telangana", value: "nizamabad", state: "Telangana" },

  // Tripura
  { label: "Agartala, Tripura", value: "agartala", state: "Tripura" },

  // Uttar Pradesh
  { label: "Lucknow, Uttar Pradesh", value: "lucknow", state: "Uttar Pradesh" },
  { label: "Kanpur, Uttar Pradesh", value: "kanpur", state: "Uttar Pradesh" },
  { label: "Ghaziabad, Uttar Pradesh", value: "ghaziabad", state: "Uttar Pradesh" },
  { label: "Agra, Uttar Pradesh", value: "agra", state: "Uttar Pradesh" },
  { label: "Meerut, Uttar Pradesh", value: "meerut", state: "Uttar Pradesh" },
  { label: "Varanasi, Uttar Pradesh", value: "varanasi", state: "Uttar Pradesh" },
  { label: "Allahabad, Uttar Pradesh", value: "allahabad", state: "Uttar Pradesh" },
  { label: "Bareilly, Uttar Pradesh", value: "bareilly", state: "Uttar Pradesh" },
  { label: "Noida, Uttar Pradesh", value: "noida", state: "Uttar Pradesh" },
  { label: "Greater Noida, Uttar Pradesh", value: "greater-noida", state: "Uttar Pradesh" },

  // Uttarakhand
  { label: "Dehradun, Uttarakhand", value: "dehradun", state: "Uttarakhand" },
  { label: "Haridwar, Uttarakhand", value: "haridwar", state: "Uttarakhand" },
  { label: "Nainital, Uttarakhand", value: "nainital", state: "Uttarakhand" },

  // West Bengal
  { label: "Kolkata, West Bengal", value: "kolkata", state: "West Bengal" },
  { label: "Darjeeling, West Bengal", value: "darjeeling", state: "West Bengal" },
  { label: "Asansol, West Bengal", value: "asansol", state: "West Bengal" },
  { label: "Siliguri, West Bengal", value: "siliguri", state: "West Bengal" },
  { label: "Durgapur, West Bengal", value: "durgapur", state: "West Bengal" },

  // Union Territories
  { label: "New Delhi, Delhi", value: "new-delhi", state: "Delhi" },
  { label: "Ladakh, Ladakh", value: "ladakh", state: "Ladakh" },
  { label: "Leh, Ladakh", value: "leh", state: "Ladakh" },
  { label: "Puducherry, Puducherry", value: "puducherry", state: "Puducherry" },
  { label: "Andaman, Andaman & Nicobar", value: "andaman", state: "Andaman & Nicobar" },
];
