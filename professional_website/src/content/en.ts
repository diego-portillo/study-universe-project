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
    titleLines: ["Welcome! I'm Diego", 'Software Developer'],
    subtitleParts: [
      'Here you can see',
      'my AI & backend projects',
      'and contact me, so we can start',
      'working together...',
    ],
  },
  about: {
    heading: 'About my developer journey',
    cvLabel: 'Download CV',
    paragraphs: [
      [
        {
          text: 'I am a Paraguayan software developer with 5 years of experience building backend and fullstack systems for fintech and SaaS products. Graduated in Audio Technology (2016, IPAC-Asunción) in 2020, I started researching audio software and web applications and realized I needed to study software development to build my own applications.',
        },
      ],
      [
        { text: 'As this new passion grew, I studied at the ' },
        {
          text: 'Institute of Design and Technology',
          href: 'https://www.idt.com.py/',
        },
        { text: ' (As-Py 2021) and took online courses at ' },
        { text: 'Udemy', href: 'https://www.udemy.com/' },
        { text: ' and ' },
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
          text: "From there I spent nearly 3 years working remotely for a US company, Approach Software, building fullstack features for a climbing-gym CRM used by clients across the US, Canada and Australia. I'm now focused on AI software engineering — I've built a multi-provider LLM chat API and an evaluated RAG agent with LangChain, FastAPI and pgvector. Below you can see the details about my work...",
        },
      ],
    ],
  },
  technologies: {
    heading: 'Technologies',
    categories: [
      {
        label: 'languages',
        logos: [
          {
            alt: 'Python',
            forLightTheme: 'python.svg',
            forDarkTheme: 'python.svg',
          },
          {
            alt: 'TypeScript',
            forLightTheme: 'typescript.svg',
            forDarkTheme: 'typescript.svg',
          },
          {
            alt: 'JavaScript',
            forLightTheme: 'javascript.svg',
            forDarkTheme: 'javascript.svg',
          },
          { alt: 'Java', forLightTheme: 'java.svg', forDarkTheme: 'java.svg' },
        ],
      },
      {
        label: 'backend & frontend',
        logos: [
          {
            alt: 'Node.js',
            forLightTheme: 'nodejs.svg',
            forDarkTheme: 'nodejs-white.svg',
          },
          {
            alt: 'FastAPI',
            forLightTheme: 'fastapi.svg',
            forDarkTheme: 'fastapi-white.svg',
          },
          {
            alt: 'Django',
            forLightTheme: 'django.png',
            forDarkTheme: 'django-white.svg',
          },
          {
            alt: 'Spring Boot',
            forLightTheme: 'spring.svg',
            forDarkTheme: 'spring.svg',
          },
          {
            alt: 'React',
            forLightTheme: 'react.svg',
            forDarkTheme: 'react.svg',
          },
          {
            alt: 'Next.js',
            forLightTheme: 'nextjs.svg',
            forDarkTheme: 'nextjs-white.svg',
          },
        ],
      },
      {
        label: 'AI & LLM',
        logos: [
          {
            alt: 'OpenAI',
            forLightTheme: 'openai.svg',
            forDarkTheme: 'openai-white.svg',
          },
          {
            alt: 'Anthropic',
            forLightTheme: 'anthropic.svg',
            forDarkTheme: 'anthropic-white.svg',
          },
          {
            alt: 'Google Gemini',
            forLightTheme: 'google-gemini.svg',
            forDarkTheme: 'google-gemini-white.svg',
          },
        ],
      },
      {
        label: 'data & cloud',
        logos: [
          {
            alt: 'PostgreSQL',
            forLightTheme: 'postgresql.svg',
            forDarkTheme: 'postgres-white.svg',
          },
          {
            alt: 'MySQL',
            forLightTheme: 'mysql.svg',
            forDarkTheme: 'mysql.svg',
          },
          {
            alt: 'AWS',
            forLightTheme: 'aws.svg',
            forDarkTheme: 'aws-white.svg',
          },
          {
            alt: 'Docker',
            forLightTheme: 'docker.svg',
            forDarkTheme: 'docker.svg',
          },
          {
            alt: 'Linux',
            forLightTheme: 'linux.svg',
            forDarkTheme: 'linux.svg',
          },
        ],
      },
      {
        label: 'tools',
        logos: [
          { alt: 'Git', forLightTheme: 'git.svg', forDarkTheme: 'git.svg' },
          {
            alt: 'GitHub',
            forLightTheme: 'github-black.svg',
            forDarkTheme: 'github-white.svg',
          },
          {
            alt: 'Bitbucket',
            forLightTheme: 'bitbucker.svg',
            forDarkTheme: 'bitbucker.svg',
          },
          { alt: 'Jira', forLightTheme: 'jira.svg', forDarkTheme: 'jira.svg' },
        ],
      },
    ],
  },
  projects: {
    heading: 'Work',
    workSubtitle:
      'These are some projects that I worked on as a TAXit! employee.',
    work: [
      {
        id: 'taxit',
        orientation: 'horizontal',
        displayFirst: true,
        href: 'https://www.taxit.com.py',
        logo: 'taxit.svg',
        logoId: 'taxit-logo',
        preview: 'taxit-web.png',
        title: 'Personal Finances and Tax Accounting Services',
        stack: 'Django, Jquery, PostgreSQL, Spring, Azure',
      },
      {
        id: 'taxit-support',
        orientation: 'vertical',
        displayFirst: false,
        href: 'https://irp.taxit.com.py',
        logo: 'taxit-support.svg',
        logoId: 'taxit-support-logo',
        preview: 'taxit-support.png',
        title: 'Customer Support Portal with Content Management System',
        stack: 'Django, Wagtail, PostgreSQL, HTML, CSS, Nginx, Gunicorn',
      },
      {
        id: 'taxit-cloud',
        orientation: 'horizontal',
        displayFirst: true,
        href: 'https://taxitcloud.com/',
        logo: 'taxit-cloud.svg',
        logoId: 'taxit-cloud-logo',
        preview: 'taxit-cloud.png',
        title: 'Electronic Invoicing Services for Individuals and Companies',
        stack:
          'Docker, Redis, Spring Boot, Keycloak, Django, PostgreSQL, MySQL',
        clientLogos: [
          { id: 'biggie', src: 'biggie.svg', alt: 'Biggie' },
          { id: 'burger-king', src: 'bk.svg', alt: 'Burger King' },
          { id: 'ultima-hora', src: 'uh.svg', alt: 'Última Hora' },
          { id: 'mickey', src: 'mickey.svg', alt: 'Mickey' },
          { id: 'BNA', src: 'bna.svg', alt: 'Banco Nación Argentina' },
          { id: 'sallustro', src: 'sallustro.svg', alt: 'Sallustro' },
        ],
      },
    ],
    personalHeading: 'Personal Projects',
    personal: [
      {
        id: 'reuma',
        orientation: 'horizontal',
        displayFirst: false,
        href: 'https://reuma-images-demo-diego-portillo.vercel.app/',
        logo: 'reuma.svg',
        logoId: 'reuma-logo',
        preview: 'reuma.png',
        title: 'Rheumatology Image Bank for Professional Doctors and Students',
        stack: 'Next.js, Typescript, React, Redux, TailwindCSS, NPM, Webpack',
      },
      {
        id: 'ai-hub',
        orientation: 'vertical',
        displayFirst: false,
        href: 'https://ai-2z4c4itsf-diegoportillos-projects.vercel.app/',
        logo: 'ai-hub.svg',
        logoId: 'ai-hub-logo',
        preview: 'https://img.youtube.com/vi/RKUtU4oiTFc/hqdefault.jpg',
        title: 'Multi-Provider LLM Chat, Image & Audio Hub',
        stack:
          'Next.js, TypeScript, Vercel AI SDK, OpenAI, Anthropic, Google, ElevenLabs',
        demoHref: 'https://youtu.be/RKUtU4oiTFc',
        demoLabel: 'Watch demo',
      },
      {
        id: 'finance-rag',
        orientation: 'horizontal',
        displayFirst: true,
        href: 'https://finance-rag-agent-i0ca.onrender.com',
        logo: 'finance-rag.svg',
        logoId: 'finance-rag-logo',
        preview: 'https://img.youtube.com/vi/WUIBx6V2yR8/hqdefault.jpg',
        title: 'Finance RAG Agent over SEC Filings',
        stack: 'FastAPI, LangChain, LangGraph, Cohere, pgvector, RAGAS',
        demoHref: 'https://youtu.be/WUIBx6V2yR8',
        demoLabel: 'Watch demo',
      },
    ],
  },
  contact: {
    availabilityLabel: 'Limited Availability',
    headline: 'Want to start a project together? Get in touch',
    emailLabel: 'Email',
    copyLabel: 'Copy to Clipboard',
    copiedLabel: 'Copied!',
    copyrightLabel: 'Diego Portillo. All Rights Reserved',
  },
};
