import type { SiteContent } from './types';

export const en: SiteContent = {
  nav: {
    home: 'home',
    about: 'about',
    technologies: 'technologies',
    projects: 'projects',
    contact: 'contact',
  },
  languageToggleLabel: 'Ver en Español',
  hero: {
    titleLines: ["Welcome! I'm Diego Portillo", 'Fullstack AI Software Engineer'],
    subtitleParts: [
      'Here you can see',
      'my work.',
      'Reach out and',
      "let's build something together...",
    ],
  },
  about: {
    heading: 'About my developer journey',
    cvLabel: 'Download CV',
    paragraphs: [
      [
        {
          text: 'I am a Paraguayan software developer with {years} years of experience building backend and fullstack systems for fintech and SaaS products. Graduated in Audio Technology (2016, IPAC-Asunción) in 2020, I started researching audio software and web applications and realized I needed to study software development to build my own applications.',
        },
      ],
      [
        {
          text: 'As this new passion grew, I became self-taught, taking online courses at ',
        },
        { text: 'Platzi', href: 'https://platzi.com/' },
        {
          text: '. With this education, I secured my first job as a Fullstack Developer at a Paraguayan fintech startup called ',
        },
        { text: 'TAXit!', href: 'https://www.taxit.com.py/' },
        {
          text: ', where we built software for personal finance and electronic billing.',
        },
      ],
      [
        {
          text: "From there I've been working remotely for a US company, Approach Software, for the past 3 years and counting, building fullstack features for a climbing-gym CRM used by clients across the US, Canada and Australia. I'm now focused on AI software engineering — I've built a multi-provider LLM chat API and an evaluated RAG agent with LangChain, FastAPI and pgvector. Below you can see the details about my work...",
        },
      ],
    ],
  },
  technologies: {
    heading: 'Technologies',
    categories: [
      {
        label: 'frameworks',
        logos: [
          {
            alt: 'Node.js',
            href: 'https://nodejs.org/',
            forLightTheme: 'nodejs.svg',
            forDarkTheme: 'nodejs-white.svg',
          },
          {
            alt: 'FastAPI',
            href: 'https://fastapi.tiangolo.com/',
            forLightTheme: 'fastapi.svg',
            forDarkTheme: 'fastapi-white.svg',
          },
          {
            alt: 'Django',
            href: 'https://www.djangoproject.com/',
            forLightTheme: 'django.png',
            forDarkTheme: 'django-white.svg',
          },
          {
            alt: 'Spring Boot',
            href: 'https://spring.io/projects/spring-boot',
            forLightTheme: 'spring.svg',
            forDarkTheme: 'spring.svg',
          },
          {
            alt: 'React',
            href: 'https://react.dev/',
            forLightTheme: 'react.svg',
            forDarkTheme: 'react.svg',
          },
          {
            alt: 'Next.js',
            href: 'https://nextjs.org/',
            forLightTheme: 'nextjs.svg',
            forDarkTheme: 'nextjs-white.svg',
          },
          {
            alt: 'Wagtail',
            href: 'https://wagtail.org/',
            forLightTheme: 'wagtail.svg',
            forDarkTheme: 'wagtail-white.svg',
          },
          {
            alt: 'Keycloak',
            href: 'https://www.keycloak.org/',
            forLightTheme: 'keycloak.svg',
            forDarkTheme: 'keycloak-white.svg',
          },
        ],
      },
      {
        label: 'languages',
        logos: [
          {
            alt: 'Python',
            href: 'https://www.python.org/',
            forLightTheme: 'python.svg',
            forDarkTheme: 'python.svg',
          },
          {
            alt: 'TypeScript',
            href: 'https://www.typescriptlang.org/',
            forLightTheme: 'typescript.svg',
            forDarkTheme: 'typescript.svg',
          },
          {
            alt: 'JavaScript',
            href: 'https://developer.mozilla.org/docs/Web/JavaScript',
            forLightTheme: 'javascript.svg',
            forDarkTheme: 'javascript.svg',
          },
          {
            alt: 'Java',
            href: 'https://www.java.com/',
            forLightTheme: 'java.svg',
            forDarkTheme: 'java.svg',
          },
        ],
      },
      {
        label: 'AI & LLM',
        logos: [
          {
            alt: 'OpenAI',
            href: 'https://openai.com/',
            forLightTheme: 'openai.svg',
            forDarkTheme: 'openai-white.svg',
          },
          {
            alt: 'Anthropic',
            href: 'https://www.anthropic.com/',
            forLightTheme: 'anthropic.svg',
            forDarkTheme: 'anthropic-white.svg',
          },
          {
            alt: 'Google Gemini',
            href: 'https://deepmind.google/technologies/gemini/',
            forLightTheme: 'google-gemini.svg',
            forDarkTheme: 'google-gemini-white.svg',
          },
          {
            alt: 'LangChain',
            href: 'https://www.langchain.com/',
            forLightTheme: 'langchain.svg',
            forDarkTheme: 'langchain-white.svg',
          },
          {
            alt: 'RAGAS',
            href: 'https://www.ragas.io/',
            forLightTheme: 'ragas.svg',
            forDarkTheme: 'ragas-white.svg',
          },
          {
            alt: 'ElevenLabs',
            href: 'https://elevenlabs.io/',
            forLightTheme: 'elevenlabs.svg',
            forDarkTheme: 'elevenlabs-white.svg',
          },
          {
            alt: 'LangSmith',
            href: 'https://smith.langchain.com/',
            forLightTheme: 'langsmith.svg',
            forDarkTheme: 'langsmith.svg',
          },
        ],
      },
      {
        label: 'databases',
        logos: [
          {
            alt: 'PostgreSQL',
            href: 'https://www.postgresql.org/',
            forLightTheme: 'postgresql.svg',
            forDarkTheme: 'postgres-white.svg',
          },
          {
            alt: 'MySQL',
            href: 'https://www.mysql.com/',
            forLightTheme: 'mysql.svg',
            forDarkTheme: 'mysql.svg',
          },
          {
            alt: 'DynamoDB',
            href: 'https://aws.amazon.com/dynamodb/',
            forLightTheme: 'dynamodb.svg',
            forDarkTheme: 'dynamodb-white.svg',
          },
          {
            alt: 'Redis',
            href: 'https://redis.io/',
            forLightTheme: 'redis.svg',
            forDarkTheme: 'redis-white.svg',
          },
        ],
      },
      {
        label: 'devops',
        logos: [
          {
            alt: 'AWS',
            href: 'https://aws.amazon.com/',
            forLightTheme: 'aws.svg',
            forDarkTheme: 'aws-white.svg',
          },
          {
            alt: 'Docker',
            href: 'https://www.docker.com/',
            forLightTheme: 'docker.svg',
            forDarkTheme: 'docker.svg',
          },
          {
            alt: 'GitHub Actions',
            href: 'https://github.com/features/actions',
            forLightTheme: 'github-actions.png',
            forDarkTheme: 'github-actions.png',
          },
          {
            alt: 'Bitbucket Pipelines',
            href: 'https://www.atlassian.com/software/bitbucket/features/pipelines',
            forLightTheme: 'bitbucket-pipelines.png',
            forDarkTheme: 'bitbucket-pipelines.png',
          },
        ],
      },
      {
        label: 'operating systems',
        logos: [
          {
            alt: 'Linux',
            href: 'https://www.linux.org/',
            forLightTheme: 'linux.svg',
            forDarkTheme: 'linux.svg',
          },
          {
            alt: 'macOS',
            href: 'https://www.apple.com/macos/',
            forLightTheme: 'apple.svg',
            forDarkTheme: 'apple-white.svg',
          },
          {
            alt: 'Windows',
            href: 'https://www.microsoft.com/windows',
            forLightTheme: 'windows.svg',
            forDarkTheme: 'windows-white.svg',
          },
        ],
      },
      {
        label: 'Version Control & PM',
        logos: [
          {
            alt: 'Git',
            href: 'https://git-scm.com/',
            forLightTheme: 'git.svg',
            forDarkTheme: 'git.svg',
          },
          {
            alt: 'GitHub',
            href: 'https://github.com/',
            forLightTheme: 'github-black.svg',
            forDarkTheme: 'github-white.svg',
          },
          {
            alt: 'Bitbucket',
            href: 'https://bitbucket.org/',
            forLightTheme: 'bitbucker.svg',
            forDarkTheme: 'bitbucker.svg',
          },
          {
            alt: 'Jira',
            href: 'https://www.atlassian.com/software/jira',
            forLightTheme: 'jira.svg',
            forDarkTheme: 'jira.svg',
          },
        ],
      },
    ],
  },
  projects: {
    heading: 'Work',
    aiHeading: 'AI Projects',
    ai: [
      {
        id: 'finance-rag',
        title: 'Finance RAG Agent over SEC Filings',
        stack: 'FastAPI, LangChain, LangGraph, Cohere, pgvector, RAGAS',
        youtubeId: 'WUIBx6V2yR8',
        liveHref: 'https://rag.diegoportillo.dev',
        repoHref:
          'https://github.com/diego-portillo/study-universe-project/tree/main/finance_rag_agent',
      },
      {
        id: 'ai-hub',
        title: 'Multi-Provider LLM Chat, Image & Audio Hub',
        stack:
          'Next.js, TypeScript, Vercel AI SDK, OpenAI, Anthropic, Google, ElevenLabs',
        youtubeId: 'RKUtU4oiTFc',
        liveHref: 'https://ai-hub.diegoportillo.dev',
        repoHref:
          'https://github.com/diego-portillo/study-universe-project/tree/main/ai_hub',
      },
    ],
    featuredClient: {
      heading: 'Working for Approach.app',
      description:
        "Since February 2024 I've worked remotely as a Contract Software Developer for Approach, a US company building bouldering and climbing gym management software. I refactored a legacy Node.js shopping-cart backend to improve system efficiency by 40%, built multi-location features for memberships, check-ins, promo codes, payments, calendars and tickets, and resolved over 100 production bug tickets — all in a stateless CRM used by gyms across the US, Canada and Australia, working fullstack with Node.js, React, MySQL and AWS.",
      href: 'https://www.approach.app/',
      preview: 'approach-preview.jpg',
    },
    workSubtitle: 'Working for TAXit!',
    work: [
      {
        id: 'taxit',
        href: 'https://www.taxit.com.py',
        preview: 'taxit-web.png',
        title: 'Personal Finances and Tax Accounting Services',
        stack: 'Django, Jquery, PostgreSQL, Spring, Azure',
      },
      {
        id: 'taxit-support',
        href: 'https://irp.taxit.com.py',
        preview: 'taxit-support.png',
        title: 'Customer Support Portal with Content Management System',
        stack: 'Django, Wagtail, PostgreSQL, HTML, CSS, Nginx, Gunicorn',
      },
      {
        id: 'taxit-cloud',
        href: 'https://taxitcloud.com/',
        preview: 'taxit-cloud.png',
        title: 'Electronic Invoicing Services for Individuals and Companies',
        stack:
          'Docker, Redis, Spring Boot, Keycloak, Django, PostgreSQL, MySQL',
        clientLogos: [
          { id: 'biggie', src: 'biggie.svg', alt: 'Biggie' },
          { id: 'burger-king', src: 'bk.svg', alt: 'Burger King' },
          { id: 'ultima-hora', src: 'uh.svg', alt: 'Última Hora' },
          { id: 'mickey', src: 'mickey.svg', alt: 'Mickey' },
          { id: 'pedidosya', src: 'pedidosya.svg', alt: 'PedidosYa' },
          { id: 'BNA', src: 'bna.svg', alt: 'Banco Nación Argentina' },
          { id: 'sallustro', src: 'sallustro.svg', alt: 'Sallustro' },
        ],
      },
    ],
  },
  contact: {
    headline: 'Want to start a project together? Get in touch',
    emailLabel: 'Email',
    copyLabel: 'Copy to Clipboard',
    copiedLabel: 'Copied!',
    backToTopLabel: 'Back to Top',
    copyrightLabel: 'Diego Portillo. All Rights Reserved',
  },
};
