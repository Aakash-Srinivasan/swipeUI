export type Card = {
  id: number;
  name: string;
  color: string;
  image: string;
  bio: string;
  age: number;
};
const data = [
  {
    id: 1,
    name: 'John Doe',
    age: 25,
    bio: 'Loves traveling and photography.',
    color: '#FF7F50',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVvcGxlfGVufDB8fDB8fHww',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 30,
    bio: 'Software engineer and coffee enthusiast.',
    color: '#6A5ACD',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    age: 28,
    bio: 'Fitness coach and health blogger.',
    color: '#3CB371',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGVvcGxlfGVufDB8fDB8fHww',
  },
  {
    id: 4,
    name: 'Emily White',
    age: 32,
    bio: 'Graphic designer and book lover.',
    color: '#FFD700',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fHww',
  },
  {
    id: 5,
    name: 'Chris Green',
    age: 29,
    bio: 'Musician and movie buff.',
    color: '#8A2BE2',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: 6,
    name: 'Sarah Brown',
    age: 27,
    bio: 'Photographer and traveler.',
    color: '#FF6347',
    image: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: 7,
    name: 'David Lee',
    age: 24,
    bio: 'Web developer and tech enthusiast.',
    color: '#20B2AA',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: 8,
    name: 'Sophia Anderson',
    age: 31,
    bio: 'Fashion blogger and yoga lover.',
    color: '#FF1493',
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: 9,
    name: 'Luke Roberts',
    age: 34,
    bio: 'Entrepreneur and startup mentor.',
    color: '#DC143C',
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: 10,
    name: 'Olivia Miller',
    age: 29,
    bio: 'Architect and sustainability advocate.',
    color: '#ADFF2F',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
  },
];

export default data;
