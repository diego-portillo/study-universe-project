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
    titleLines: ['¡Bienvenido! Soy Diego', 'Desarrollador de Software'],
    subtitleParts: [
      'Aquí puedes ver',
      'mis proyectos de IA y backend',
      'y contactarme para que podamos empezar',
      'a trabajar juntos...',
    ],
  },
  about: {
    heading: 'Sobre mi historia de desarrollador',
    cvLabel: 'Descargar CV',
    paragraphs: [
      [
        {
          text: 'Soy un desarrollador de software paraguayo con 5 años de experiencia construyendo sistemas backend y fullstack para productos fintech y SaaS. Graduado en Tecnología de Audio (2016, IPAC-Asunción) en el año 2020, comencé a investigar sobre software de audio y aplicaciones web y me di cuenta de que necesitaba estudiar desarrollo de software para construir mis propias aplicaciones.',
        },
      ],
      [
        { text: 'A medida que esta pasión crecía, estudié en el ' },
        {
          text: 'Instituto de Diseño y Tecnología',
          href: 'https://www.idt.com.py/',
        },
        { text: ' (As-Py 2021) y tomé cursos en línea en ' },
        { text: 'Udemy', href: 'https://www.udemy.com/' },
        { text: ' y ' },
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
          text: 'Desde ahí pasé casi 3 años trabajando de forma remota para una empresa de EE. UU., Approach Software, desarrollando funcionalidades fullstack para un CRM de gimnasios de escalada usado por clientes en EE. UU., Canadá y Australia. Actualmente me enfoco en ingeniería de software con IA: desarrollé una API de chat LLM multiproveedor y un agente RAG evaluado con LangChain, FastAPI y pgvector. A continuación, puedes ver los detalles sobre mi trabajo...',
        },
      ],
    ],
  },
  technologies: {
    heading: 'Tecnologías',
    categories: [
      {
        label: 'lenguajes',
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
        label: 'backend y frontend',
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
        label: 'IA y LLM',
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
        label: 'datos y nube',
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
        label: 'herramientas',
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
    heading: 'Proyectos',
    workSubtitle:
      'Estos son algunos proyectos en los que participé como empleado de TAXit!',
    work: [
      {
        id: 'taxit',
        orientation: 'horizontal',
        displayFirst: true,
        href: 'https://www.taxit.com.py',
        logo: 'taxit.svg',
        logoId: 'taxit-logo',
        preview: 'taxit-web.png',
        title: 'Servicio de finanzas personales y Liquidación de Impuestos',
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
        title:
          'Portal de soporte para clientes con sistema de gestión de contenido',
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
        title: 'Sistemas de facturación electrónica para personas y empresas',
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
    personalHeading: 'Proyectos Personales',
    personal: [
      {
        id: 'reuma',
        orientation: 'horizontal',
        displayFirst: false,
        href: 'https://reuma-images-demo-diego-portillo.vercel.app/',
        logo: 'reuma.svg',
        logoId: 'reuma-logo',
        preview: 'reuma.png',
        title:
          'Banco de imágenes de Reumatología para Médicos Profesionales y Estudiantes',
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
        title: 'Hub de Chat, Imágenes y Audio Multi-Proveedor con LLMs',
        stack:
          'Next.js, TypeScript, Vercel AI SDK, OpenAI, Anthropic, Google, ElevenLabs',
        demoHref: 'https://youtu.be/RKUtU4oiTFc',
        demoLabel: 'Ver demo',
      },
      {
        id: 'finance-rag',
        orientation: 'horizontal',
        displayFirst: true,
        href: 'https://finance-rag-agent-i0ca.onrender.com',
        logo: 'finance-rag.svg',
        logoId: 'finance-rag-logo',
        preview: 'https://img.youtube.com/vi/WUIBx6V2yR8/hqdefault.jpg',
        title: 'Agente RAG Financiero sobre Reportes de la SEC',
        stack: 'FastAPI, LangChain, LangGraph, Cohere, pgvector, RAGAS',
        demoHref: 'https://youtu.be/WUIBx6V2yR8',
        demoLabel: 'Ver demo',
      },
    ],
  },
  contact: {
    availabilityLabel: 'Disponibilidad Limitada',
    headline: '¿Quieres comenzar un proyecto juntos? Ponte en contacto',
    emailLabel: 'Email',
    copyLabel: 'Copiar al Portapapeles',
    copiedLabel: '¡Copiado!',
    copyrightLabel: 'Diego Portillo. Todos los Derechos Reservados.',
  },
};
