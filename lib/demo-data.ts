import { DocumentNode, QuizQuestion, GraphNode, GraphLink } from "./store";

export interface DemoChunk {
  id: string;
  topic: string;
  content: string;
}

export const DEMO_DOCUMENT: DocumentNode = {
  id: "demo-gravitation",
  title: "NCERT Physics Ch.8 — Gravitation",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  size: "2.4 MB",
  extractedText: `
CHAPTER 8: GRAVITATION
8.1 Introduction:
We have seen that all objects are attracted towards the Earth. A stone thrown upwards rises to a certain height and then falls back. It is said that Newton was sitting under an apple tree when an apple fell on him. The fall of the apple made Newton think. He realized that the force of gravity attracts the apple. He also reasoned that this force of gravity extends up to the moon and keeps it in its orbit.

8.2 Kepler's Laws of Planetary Motion:
Johannes Kepler analyzed the planetary observations of Tycho Brahe and formulated three laws:
1. Law of Orbits: All planets move in elliptical orbits with the Sun situated at one of the foci.
2. Law of Areas: The line joinining any planet to the Sun sweeps out equal areas in equal intervals of time. This law is a consequence of conservation of angular momentum.
3. Law of Periods: The square of the time period of revolution of a planet is proportional to the cube of the semi-major axis of its elliptical orbit: T^2 = k * a^3.

8.3 Universal Law of Gravitation:
Every body in the universe attracts every other body with a force which is directly proportional to the product of their masses and inversely proportional to the square of the distance between them.
Mathematical formulation: F = G * (m1 * m2) / r^2, where G is the Universal Gravitational Constant.
The value of G was experimentally determined by Henry Cavendish as G = 6.67 x 10^-11 N m^2 kg^-2. Gravity is a conservative, central force acting along the line joining the centers of two masses.

8.4 Acceleration due to Gravity of the Earth:
The acceleration experienced by a body during free fall under the influence of Earth's gravity is called acceleration due to gravity (g).
Near the surface of the Earth, g = G * M / R^2, where M is the mass of the Earth and R is its radius.
The value of g is approximately 9.8 m/s^2.
Variation of g:
1. With Altitude: g(h) = g * (1 - 2h / R) for h << R. Generally, g(h) = g * R^2 / (R + h)^2.
2. With Depth: g(d) = g * (1 - d / R).
Acceleration due to gravity is maximum at the poles and minimum at the equator, and decreases both with altitude and depth. At the center of the Earth, d = R, hence g = 0.

8.5 Gravitational Potential Energy:
The gravitational potential energy of a system of two masses m1 and m2 separated by a distance r is given by V(r) = -G * m1 * m2 / r.
The negative sign indicates that the gravitational force is attractive, and work must be done against it to separate the masses to infinity.

8.6 Escape Velocity:
Escape velocity (v_e) is the minimum speed required for a body to escape from the gravitational influence of a massive body (like the Earth) and never return.
v_e = sqrt(2 * G * M / R) = sqrt(2 * g * R).
For the Earth, v_e is approximately 11.2 km/s. It is independent of the mass of the escaping body and the direction of projection.

8.7 Earth Satellites and Orbital Velocity:
Satellites are natural or artificial bodies revolving around a planet.
Orbital velocity (v_o) is the speed required to keep a satellite in a circular orbit of radius r around the Earth.
v_o = sqrt(G * M / r). Near the Earth's surface, v_o = sqrt(g * R), which is approximately 7.92 km/s.
Relationship: v_e = sqrt(2) * v_o.
Time period of a satellite: T = 2 * pi * r / v_o = 2 * pi * sqrt(r^3 / (G * M)).

8.8 Energy of an Orbiting Satellite:
An orbiting satellite of mass m at distance r has both Kinetic Energy (K) and Potential Energy (U):
K = G * M * m / (2 * r)
U = -G * M * m / r
Total Mechanical Energy (E) = K + U = -G * M * m / (2 * r).
The negative total energy indicates that the satellite is bound to the Earth. The energy required to remove the satellite to infinity is called its Binding Energy: BE = -E = G * M * m / (2 * r).

8.9 Geostationary and Polar Satellites:
1. Geostationary Satellites: Satellites that remain stationary relative to the Earth. They orbit in the equatorial plane, with a period of exactly 24 hours, rotating in the same direction as Earth (West to East). Their height is approximately 36,000 km above the surface. Used for telecommunication.
2. Polar Satellites: Satellites revolving in polar orbits around the Earth at a much lower altitude (500 to 800 km). Their period is about 100 minutes. They scan different strips of Earth as it rotates, making them ideal for weather monitoring and environmental imaging.

8.10 Weightlessness:
Weight of a body is the force with which it is attracted towards the Earth, measured by the normal reaction force exerted on the body by the surface supporting it.
When a body is in free fall (e.g., inside an orbiting satellite), the acceleration of the body is equal to the acceleration due to gravity (a = g).
The normal reaction force R = m * (g - a) = m * (g - g) = 0.
Thus, the effective weight of the body becomes zero, causing a state of weightlessness. Weightlessness does not mean gravity is zero; it means the contact reaction force is zero.
  `,
  summary: {
    overview: "This chapter covers the fundamentals of gravity, beginning with Kepler's Laws of Planetary Motion and Newton's Universal Law of Gravitation. It defines acceleration due to gravity (g) and its variations, gravitational potential energy, escape velocity, and the dynamics of orbiting satellites, culminating in weightlessness.",
    keyPoints: [
      "Kepler's Laws describe elliptical orbits, constant areal speed, and the relationship T^2 ∝ a^3.",
      "Newton's Universal Law of Gravitation defines the attractive force F = G * m1 * m2 / r^2.",
      "Acceleration due to gravity (g) decreases with both altitude above and depth below the Earth's surface.",
      "Escape velocity (11.2 km/s for Earth) represents the minimum speed to break free from gravitational bounds.",
      "Orbiting satellites possess negative total energy, signifying a bound system, and experience weightlessness due to zero normal reaction force."
    ],
    formulas: [
      "F = G * m1 * m2 / r^2 (Gravitational Force)",
      "g = G * M / R^2 (Acceleration due to gravity)",
      "g(h) ≈ g * (1 - 2h/R) (Altitude variation, h << R)",
      "g(d) = g * (1 - d/R) (Depth variation)",
      "v_e = sqrt(2 * g * R) (Escape speed)",
      "v_o = sqrt(g * R) (Orbital speed near Earth)",
      "E = -G * M * m / (2 * r) (Total satellite energy)"
    ],
    examTips: [
      "Be prepared to derive g(h) and g(d); pay attention to the binomial approximation conditions for altitude.",
      "Remember that Kepler's second law represents conservation of angular momentum, a common theoretical question.",
      "Ensure you use correct units for G (6.67 x 10^-11 N m^2 kg^-2) during numerical calculations."
    ],
    confusedTopics: [
      "Do not confuse universal constant G (does not change) with acceleration g (varies by position).",
      "Students often think weightlessness in space means gravity is zero. Gravity is very active (keeping the satellite in orbit); weightlessness happens because the floor falls at the same rate, making normal support force zero."
    ]
  }
};

export const DEMO_CHUNKS: DemoChunk[] = [
  {
    id: "chunk-1",
    topic: "Kepler's Laws",
    content: "Johannes Kepler formulated three laws of planetary motion: (1) Law of Orbits: All planets move in elliptical orbits with the Sun at one focus. (2) Law of Areas: The line joining a planet to the Sun sweeps out equal areas in equal times, implying conservation of angular momentum. (3) Law of Periods: The square of the time period T of revolution of a planet is proportional to the cube of the semi-major axis a of its elliptical orbit (T^2 ∝ a^3)."
  },
  {
    id: "chunk-2",
    topic: "Universal Law of Gravitation",
    content: "Newton's Universal Law of Gravitation states that every mass in the universe attracts every other mass with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1 * m2) / r^2. G is the Universal Gravitational Constant (6.67 x 10^-11 N m^2 kg^-2), measured by Henry Cavendish."
  },
  {
    id: "chunk-3",
    topic: "Acceleration due to Gravity",
    content: "Acceleration due to gravity g on the Earth's surface is g = G * M / R^2 ≈ 9.8 m/s^2. It varies with: (1) Altitude: g(h) = g * R^2 / (R+h)^2 ≈ g * (1 - 2h/R). (2) Depth: g(d) = g * (1 - d/R). (3) Latitude: due to Earth's rotation and shape, g is maximum at the poles and minimum at the equator. At the center of the Earth, g = 0."
  },
  {
    id: "chunk-4",
    topic: "Gravitational Potential Energy",
    content: "Gravitational potential energy of two masses m1 and m2 at distance r is V(r) = -G * m1 * m2 / r. The negative sign shows attraction. Gravitational potential is the potential energy per unit mass at that point: V = -G * M / r. Work must be done to move a mass against gravitational fields."
  },
  {
    id: "chunk-5",
    topic: "Escape Velocity",
    content: "Escape velocity v_e is the minimum speed needed for an object to escape the gravitational field of a primary body. v_e = sqrt(2 * G * M / R) = sqrt(2 * g * R). On Earth, escape velocity is approximately 11.2 km/s. It is independent of the mass of the escaping body and the angle of launch."
  },
  {
    id: "chunk-6",
    topic: "Satellite Dynamics",
    content: "An Earth satellite orbits with speed v_o = sqrt(G * M / r). Near Earth's surface, v_o = sqrt(g * R) ≈ 7.92 km/s. The time period T = 2 * pi * sqrt(r^3 / (G * M)). Kinetic Energy K = G*M*m/(2r), Potential Energy U = -G*M*m/r, Total Mechanical Energy E = -G*M*m/(2r). The negative total energy signifies that it is a bound system."
  },
  {
    id: "chunk-7",
    topic: "Geostationary and Polar Satellites",
    content: "Geostationary satellites orbit in the equatorial plane, rotate west-to-east with a 24-hour period, and remain fixed relative to Earth at an altitude of ~36,000 km (telecom). Polar satellites travel north-south at low altitude (500-800 km) with a period of ~100 minutes (weather imaging)."
  },
  {
    id: "chunk-8",
    topic: "Weightlessness",
    content: "Weightlessness is experienced by bodies in free fall (e.g. inside an orbiting satellite). A satellite accelerates towards Earth's center at exactly g, so the support/normal reaction force R from the floor of the satellite is R = m(g - a) = m(g - g) = 0. The effective weight is zero. Gravity is NOT zero; only normal reaction is zero."
  }
];

export const DEMO_QUIZ: QuizQuestion[] = [
  {
    id: "q-1",
    question: "Kepler's Second Law (Law of Areas) is a direct consequence of which conservation principle?",
    options: [
      "A) Conservation of Linear Momentum",
      "B) Conservation of Energy",
      "C) Conservation of Angular Momentum",
      "D) Conservation of Mass"
    ],
    correctAnswer: 2,
    explanation: "The Law of Areas states that a planet sweeps out equal areas in equal times. Since the gravitational force is a central force, the torque acting on the planet is zero, leading to the conservation of angular momentum.",
    topic: "Kepler's Laws"
  },
  {
    id: "q-2",
    question: "How does the acceleration due to gravity (g) change at the center of the Earth?",
    options: [
      "A) It becomes infinite",
      "B) It is equal to 9.8 m/s^2",
      "C) It becomes zero",
      "D) It remains same as equatorial value"
    ],
    correctAnswer: 2,
    explanation: "At the center of the Earth, the depth d is equal to the Earth's radius R. Applying the formula g(d) = g * (1 - d/R), we get g(R) = g * (1 - 1) = 0.",
    topic: "Acceleration due to Gravity"
  },
  {
    id: "q-3",
    question: "The escape velocity of a body from the Earth depends on which of the following?",
    options: [
      "A) Mass of the escaping body",
      "B) Mass of the Earth",
      "C) Angle of projection",
      "D) All of the above"
    ],
    correctAnswer: 1,
    explanation: "The escape velocity formula is v_e = sqrt(2 * G * M / R). It depends only on the mass of the planet (M) and its radius (R). It is independent of the body's mass and the projection angle.",
    topic: "Escape Velocity"
  },
  {
    id: "q-4",
    question: "What is the relation between the escape velocity (v_e) and orbital velocity (v_o) near the surface of the Earth?",
    options: [
      "A) v_e = v_o / sqrt(2)",
      "B) v_e = sqrt(2) * v_o",
      "C) v_e = 2 * v_o",
      "D) v_e = v_o"
    ],
    correctAnswer: 1,
    explanation: "Near the surface, escape velocity v_e = sqrt(2 * g * R) and orbital velocity v_o = sqrt(g * R). Dividing the two gives v_e = sqrt(2) * v_o.",
    topic: "Satellite Dynamics"
  },
  {
    id: "q-5",
    question: "Why does an astronaut feel weightless inside a satellite orbiting the Earth?",
    options: [
      "A) There is no gravity in space",
      "B) The satellite shielding blocks Earth's gravitational pull",
      "C) Both astronaut and satellite are in free fall with the same acceleration",
      "D) Centrifugal force cancels out the mass of the astronaut"
    ],
    correctAnswer: 2,
    explanation: "Both the astronaut and the satellite accelerate towards the Earth at the rate of local gravity (a = g). Since they fall together, the normal reaction force from the floor is zero (R = m(g-a) = 0), producing weightlessness.",
    topic: "Weightlessness"
  }
];

export const DEMO_NODES: GraphNode[] = [
  { id: "n-1", label: "Kepler's Laws", strength: 80, status: "learning" },
  { id: "n-2", label: "Universal Law", strength: 90, status: "mastered" },
  { id: "n-3", label: "Acceleration due to Gravity", strength: 55, status: "weak" },
  { id: "n-4", label: "Potential Energy", strength: 70, status: "learning" },
  { id: "n-5", label: "Escape Velocity", strength: 88, status: "mastered" },
  { id: "n-6", label: "Satellite Dynamics", strength: 40, status: "weak" },
  { id: "n-7", label: "Geostationary & Polar", strength: 75, status: "learning" },
  { id: "n-8", label: "Weightlessness", strength: 30, status: "forgotten" }
];

export const DEMO_LINKS: GraphLink[] = [
  { source: "n-1", target: "n-2" },
  { source: "n-2", target: "n-3" },
  { source: "n-2", target: "n-4" },
  { source: "n-3", target: "n-5" },
  { source: "n-4", target: "n-5" },
  { source: "n-3", target: "n-6" },
  { source: "n-6", target: "n-7" },
  { source: "n-6", target: "n-8" }
];
