import type { SiteContent } from './types';

export const es: SiteContent = {
  nav: {
    home: 'inicio',
    about: 'sobre mí',
    technologies: 'tecnologías',
    projects: 'proyectos',
    contact: 'contacto',
  },
  languageToggleLabel: 'View in English',
  hero: {
    titleLines: ['¡Bienvenido! Soy Diego Portillo', 'Ingeniero de Software Fullstack en IA'],
    subtitleParts: [
      'Aquí puedes ver',
      'mi trabajo.',
      'Escríbeme y',
      'construyamos algo juntos...',
    ],
  },
  about: {
    heading: 'Sobre mi historia de desarrollador',
    cvLabel: 'Descargar CV',
    paragraphs: [
      [
        {
          text: 'Soy un desarrollador de software paraguayo con {years} años de experiencia construyendo sistemas backend y fullstack para productos fintech y SaaS. Graduado en Tecnología de Audio (2016, IPAC-Asunción) en el año 2020, comencé a investigar sobre software de audio y aplicaciones web y me di cuenta de que necesitaba estudiar desarrollo de software para construir mis propias aplicaciones.',
        },
      ],
      [
        {
          text: 'A medida que esta pasión crecía, me formé de manera autodidacta, tomando cursos en línea en ',
        },
        { text: 'Platzi', href: 'https://platzi.com/' },
        {
          text: '. Con esta formación, conseguí mi primer trabajo como Desarrollador Fullstack en una startup fintech paraguaya llamada ',
        },
        { text: 'TAXit!', href: 'https://www.taxit.com.py/' },
        {
          text: ', donde desarrollamos software para finanzas personales y facturación electrónica.',
        },
      ],
      [
        {
          text: 'Desde ahí, llevo casi 3 años y sigo trabajando de forma remota para una empresa de EE. UU., Approach Software, desarrollando funcionalidades fullstack para un CRM de gimnasios de escalada usado por clientes en EE. UU., Canadá y Australia. Actualmente me enfoco en ingeniería de software con IA: desarrollé una API de chat LLM multiproveedor y un agente RAG evaluado con LangChain, FastAPI y pgvector. A continuación, puedes ver los detalles sobre mi trabajo...',
        },
      ],
    ],
  },
  technologies: {
    heading: 'Tecnologías',
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
        label: 'lenguajes',
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
        label: 'IA y LLM',
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
        label: 'bases de datos',
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
        label: 'sistemas operativos',
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
        label: 'Control de Versiones y PM',
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
    heading: 'Proyectos',
    aiHeading: 'Proyectos de IA',
    ai: [
      {
        id: 'finance-rag',
        title: 'Agente RAG Financiero sobre Reportes de la SEC',
        stack: 'FastAPI, LangChain, LangGraph, Cohere, pgvector, RAGAS',
        youtubeId: 'WUIBx6V2yR8',
        liveHref: 'https://rag.diegoportillo.dev',
        repoHref:
          'https://github.com/diego-portillo/study-universe-project/tree/main/finance_rag_agent',
      },
      {
        id: 'ai-hub',
        title: 'Hub de Chat, Imágenes y Audio Multi-Proveedor con LLMs',
        stack:
          'Next.js, TypeScript, Vercel AI SDK, OpenAI, Anthropic, Google, ElevenLabs',
        youtubeId: 'RKUtU4oiTFc',
        liveHref: 'https://ai-hub.diegoportillo.dev',
        repoHref:
          'https://github.com/diego-portillo/study-universe-project/tree/main/ai_hub',
      },
    ],
    featuredClient: {
      heading: 'Trabajando para Approach.app',
      description:
        'Desde febrero de 2024 trabajo de forma remota como Desarrollador de Software Contratista para Approach, una empresa de EE. UU. que desarrolla software de gestión para gimnasios de escalada y boulder. Refactoricé un backend legacy de carritos de compra en Node.js, mejorando la eficiencia del sistema en un 40%, desarrollé funcionalidades multi-locación para membresías, check-ins, códigos promocionales, pagos, calendarios y tickets, y resolví más de 100 tickets de bugs en producción, todo en un CRM stateless usado por gimnasios en EE. UU., Canadá y Australia, trabajando fullstack con Node.js, React, MySQL y AWS.',
      href: 'https://www.approach.app/',
      preview: 'approach-preview.jpg',
    },
    workSubtitle: 'Trabajando para TAXit!',
    work: [
      {
        id: 'taxit',
        href: 'https://www.taxit.com.py',
        preview: 'taxit-web.png',
        title: 'Servicio de finanzas personales y Liquidación de Impuestos',
        stack: 'Django, Jquery, PostgreSQL, Spring, Azure',
      },
      {
        id: 'taxit-support',
        href: 'https://irp.taxit.com.py',
        preview: 'taxit-support.png',
        title:
          'Portal de soporte para clientes con sistema de gestión de contenido',
        stack: 'Django, Wagtail, PostgreSQL, HTML, CSS, Nginx, Gunicorn',
      },
      {
        id: 'taxit-cloud',
        href: 'https://taxitcloud.com/',
        preview: 'taxit-cloud.png',
        title: 'Sistemas de facturación electrónica para personas y empresas',
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
    headline: '¿Quieres comenzar un proyecto juntos? Ponte en contacto',
    emailLabel: 'Email',
    copyLabel: 'Copiar al Portapapeles',
    copiedLabel: '¡Copiado!',
    backToTopLabel: 'Volver Arriba',
    copyrightLabel: 'Diego Portillo. Todos los Derechos Reservados.',
  },
};
