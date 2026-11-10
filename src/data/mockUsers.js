export const DEMO_ADMIN = {
  id: "user-admin",
  name: "Dr. Malini Wijesinghe",
  email: "admin@auralib.lk",
  role: "admin",
  membershipId: "AL-ADMIN-01",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
  title: "Library / Admin & Systems Director",
  department: "AuraLib National Smart Library, Colombo 07",
  phone: "+94 (11) 268-6142",
  joinedDate: "2021-03-15",
  status: "Active"
};

export const DEMO_MEMBER = {
  id: "user-member-1",
  name: "Kasun Perera",
  email: "kasun.perera@gmail.com",
  role: "member",
  membershipId: "AL-2024-8841",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
  phone: "+94 (77) 345-6789",
  address: "45/2 Galle Road, Bambalapitiya, Colombo 04",
  joinedDate: "2023-08-12",
  status: "Active",
  maxBorrowLimit: 5
};

export const INITIAL_MEMBERS = [
  DEMO_MEMBER,
  {
    id: "user-member-2",
    name: "Ananya Fernando",
    email: "ananya.f@sltnet.lk",
    role: "member",
    membershipId: "AL-2023-4102",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    phone: "+94 (71) 234-5678",
    address: "18 De Kretser Place, Bambalapitiya, Colombo 04",
    joinedDate: "2023-01-20",
    status: "Active",
    maxBorrowLimit: 5
  },
  {
    id: "user-member-3",
    name: "Dinesh Jayawardena",
    email: "dinesh.j@dialog.lk",
    role: "member",
    membershipId: "AL-2023-6629",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    phone: "+94 (77) 890-1234",
    address: "99 Stanley Tilakaratne Mawatha, Nugegoda",
    joinedDate: "2023-04-11",
    status: "Active",
    maxBorrowLimit: 5
  },
  {
    id: "user-member-4",
    name: "Sanduni Silva",
    email: "sanduni.silva@uom.lk",
    role: "member",
    membershipId: "AL-2024-1182",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    phone: "+94 (76) 555-4321",
    address: "12 Bandaranayakepura, Moratuwa",
    joinedDate: "2024-02-05",
    status: "Active",
    maxBorrowLimit: 5
  },
  {
    id: "user-member-5",
    name: "Tharindu Wickramasinghe",
    email: "tharindu.w@kandy.edu.lk",
    role: "member",
    membershipId: "AL-2022-9014",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    phone: "+94 (81) 223-9876",
    address: "74 Rajapihilla Mawatha, Kandy",
    joinedDate: "2022-11-18",
    status: "Suspended",
    maxBorrowLimit: 3
  },
  {
    id: "user-member-6",
    name: "Nadeesha Rathnayake",
    email: "nadeesha.r@sliit.lk",
    role: "member",
    membershipId: "AL-2024-3390",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    phone: "+94 (70) 987-6543",
    address: "210 Kaduwela Road, Malabe",
    joinedDate: "2024-05-19",
    status: "Active",
    maxBorrowLimit: 5
  }
];
