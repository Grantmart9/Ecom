ecommerce/
├── frontend/                    # Next.js frontend + API routes (fullstack)
│   ├── src/
│   │   ├── app/                 # App router pages & API routes
│   │   │   ├── api/             # API routes (server-side)
│   │   │   └── *.tsx            # Pages
│   │   ├── db/                  # Drizzle ORM schema & client
│   │   ├── lib/                 # Utilities & stores
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml
├── .env.example
└── README.md
