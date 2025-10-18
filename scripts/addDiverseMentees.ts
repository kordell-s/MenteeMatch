import { PrismaClient, Skill, ExperienceLevel, Goal } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Creating diverse test mentee accounts across all categories...\n');

  const newMentees = [
    // MUSIC Category
    {
      name: 'Emma Rodriguez',
      email: 'emma.music@test.com',
      password: 'Test123!',
      bio: 'Aspiring music producer passionate about electronic music and sound design. Looking to learn production techniques and break into the music industry.',
      skills: ['STORYTELLING', 'COPYWRITING', 'CONTENT_STRATEGY'] as Skill[],
      experienceLevel: 'ENTRY' as ExperienceLevel,
      goals: ['LEARN_CODING', 'BUILD_PROJECTS', 'CAREER_GUIDANCE'] as Goal[],
      detailedGoals: `I'm passionate about music production and want to develop my skills in electronic music composition and sound design. I'm particularly interested in learning industry-standard DAWs like Ableton Live and Logic Pro, understanding music theory for electronic genres, and mastering mixing and mastering techniques. I want to build a portfolio of original tracks and remixes that showcase my unique sound. I'm also looking for guidance on breaking into the music industry, understanding licensing and publishing, networking with other producers and artists, and potentially monetizing my music through streaming platforms and sync licensing. Career advice on whether to pursue music full-time or maintain it as a side project while building financial stability would be incredibly valuable.`,
      company: null,
      title: 'Music Production Student',
      school: 'Berklee Online',
      location: 'Los Angeles, CA',
    },
    // HEALTH Category
    {
      name: 'David Martinez',
      email: 'david.health@test.com',
      password: 'Test123!',
      bio: 'Fitness enthusiast transitioning into health tech. Want to combine my passion for wellness with technology to help others achieve their health goals.',
      skills: ['PYTHON', 'DATA_SCIENCE', 'STATISTICS'] as Skill[],
      experienceLevel: 'ENTRY' as ExperienceLevel,
      goals: ['TRANSITION_CAREER', 'BUILD_PROJECTS', 'NETWORKING'] as Goal[],
      detailedGoals: `I'm a certified personal trainer looking to transition into the health tech industry. I want to learn how to develop fitness and wellness applications that help people track their health metrics, set achievable goals, and maintain motivation. I'm particularly interested in understanding how wearable technology integrates with health apps, learning about data privacy in healthcare applications, and exploring how AI can personalize fitness recommendations. I want to build a health tracking app as my portfolio project that demonstrates my understanding of both fitness science and technology. I'm seeking guidance on what programming languages and frameworks are best for health tech, how to navigate healthcare regulations like HIPAA, and how to network with professionals in the digital health space. I'm also interested in understanding career paths in health tech - whether to join a startup, work for established companies like Apple Health or Fitbit, or start my own health tech venture.`,
      company: '24/7 Fitness',
      title: 'Personal Trainer',
      school: 'NASM Certified',
      location: 'Austin, TX',
    },
    // MARKETING Category
    {
      name: 'Sophie Chen',
      email: 'sophie.marketing@test.com',
      password: 'Test123!',
      bio: 'Digital marketing specialist wanting to master data-driven marketing strategies and marketing automation tools to advance my career.',
      skills: ['DIGITAL_MARKETING', 'SEO', 'SOCIAL_MEDIA', 'CONTENT_STRATEGY'] as Skill[],
      experienceLevel: 'MID' as ExperienceLevel,
      goals: ['CAREER_GUIDANCE', 'NETWORKING', 'BUILD_PROJECTS'] as Goal[],
      detailedGoals: `I'm a digital marketing specialist with 3 years of experience, and I want to level up my career by mastering data-driven marketing strategies and marketing automation. I'm particularly interested in learning advanced Google Analytics and Google Tag Manager implementations, understanding how to build and optimize marketing funnels with tools like HubSpot or Marketo, and developing skills in A/B testing and conversion rate optimization. I want to understand how to use Python or R for marketing analytics and create custom dashboards that demonstrate ROI to stakeholders. I'm seeking mentorship on transitioning from a generalist marketing role to a specialized position in growth marketing or marketing analytics. I'd love guidance on building a personal brand as a marketing expert, networking effectively in the digital marketing community, and potentially speaking at marketing conferences. Career advice on whether to pursue a marketing leadership track or become a specialized consultant would be incredibly helpful.`,
      company: 'Digital Wave Agency',
      title: 'Digital Marketing Specialist',
      school: 'University of Texas',
      location: 'New York, NY',
    },
    // DESIGN Category
    {
      name: 'Olivia Taylor',
      email: 'olivia.design@test.com',
      password: 'Test123!',
      bio: 'Graphic designer transitioning to UX/UI design. Want to learn user-centered design principles and build a strong UX portfolio.',
      skills: ['UI', 'UX', 'FIGMA', 'DESIGN_SYSTEMS'] as Skill[],
      experienceLevel: 'ENTRY' as ExperienceLevel,
      goals: ['TRANSITION_CAREER', 'BUILD_PROJECTS', 'GET_INTO_TECH'] as Goal[],
      detailedGoals: `I'm a graphic designer with a strong foundation in visual design, and I'm transitioning into UX/UI design to create more impactful, user-centered digital experiences. I want to learn the complete UX design process from user research and wireframing to high-fidelity prototyping and usability testing. I'm particularly interested in mastering Figma for collaborative design work, understanding how to conduct user interviews and synthesize research findings, learning interaction design principles and micro-animations, and building responsive designs that work across devices. I need help creating a UX portfolio that showcases my problem-solving process, not just pretty mockups. I want guidance on presenting case studies that demonstrate my understanding of user needs, design decisions, and measurable outcomes. I'm also seeking advice on breaking into the UX field - whether to apply for junior UX roles, take on freelance projects to build experience, or pursue a UX bootcamp or certification. Mentorship on networking in the design community and preparing for UX design interviews would be incredibly valuable.`,
      company: 'CreativeWorks Studio',
      title: 'Graphic Designer',
      school: 'Rhode Island School of Design',
      location: 'San Francisco, CA',
    },
    // BUSINESS Category
    {
      name: 'Michael Okafor',
      email: 'michael.business@test.com',
      password: 'Test123!',
      bio: 'MBA graduate with entrepreneurial ambitions. Want to learn how to validate business ideas and build a tech startup from the ground up.',
      skills: ['BUSINESS_STRATEGY', 'MARKET_ANALYSIS', 'PRODUCT_MANAGEMENT'] as Skill[],
      experienceLevel: 'MID' as ExperienceLevel,
      goals: ['BUILD_PROJECTS', 'NETWORKING', 'CAREER_GUIDANCE'] as Goal[],
      detailedGoals: `I'm an MBA graduate passionate about entrepreneurship and innovation, looking to launch my own tech startup. I want to learn how to identify and validate business opportunities, conduct market research and competitive analysis, and build minimum viable products (MVPs) that solve real customer problems. I'm particularly interested in understanding lean startup methodology, learning how to pitch to investors and raise funding, developing financial models and projections for startups, and building effective go-to-market strategies. I need guidance on whether to start with a B2B or B2C product, how to find and work with technical co-founders as a non-technical founder, and how to balance business strategy with product execution. I'm seeking mentorship from successful entrepreneurs or product leaders who can help me navigate the challenges of building a startup, understanding when to pivot versus when to persevere, and developing the leadership skills necessary to scale a company. Advice on startup accelerators, networking in the startup ecosystem, and avoiding common founder mistakes would be incredibly valuable.`,
      company: null,
      title: 'Business Consultant',
      school: 'Harvard Business School',
      location: 'Boston, MA',
    },
    // CREATIVE Category
    {
      name: 'Aria Patel',
      email: 'aria.creative@test.com',
      password: 'Test123!',
      bio: 'Content creator and videographer looking to build a sustainable creative business and expand my reach on social media platforms.',
      skills: ['STORYTELLING', 'COPYWRITING', 'SOCIAL_MEDIA', 'BRANDING'] as Skill[],
      experienceLevel: 'ENTRY' as ExperienceLevel,
      goals: ['BUILD_PROJECTS', 'CAREER_GUIDANCE', 'PUBLIC_SPEAKING'] as Goal[],
      detailedGoals: `I'm a content creator specializing in videography and storytelling, and I want to build a sustainable creative business while expanding my influence on platforms like YouTube, Instagram, and TikTok. I'm interested in learning advanced video editing techniques in Premiere Pro and DaVinci Resolve, understanding how to develop a consistent content strategy that grows my audience, mastering storytelling frameworks that create emotional connections with viewers, and learning how to monetize content through brand partnerships, sponsorships, and digital products. I want guidance on building a personal brand that stands out in a crowded creator economy, developing a unique visual style and voice, and balancing authenticity with commercial opportunities. I'm seeking mentorship on negotiating with brands, understanding content creator business models, managing the business side of creative work including contracts and pricing, and potentially scaling by building a small production team. Advice on public speaking opportunities, creating courses or workshops to teach my skills, and long-term career sustainability as a creator would be incredibly helpful.`,
      company: 'Freelance',
      title: 'Content Creator & Videographer',
      school: 'New York Film Academy',
      location: 'Miami, FL',
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const menteeData of newMentees) {
    try {
      console.log(`\n📝 Creating: ${menteeData.name} (${menteeData.email})`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: menteeData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(menteeData.password, 10);

      // Create user and mentee in a transaction
      await prisma.user.create({
        data: {
          name: menteeData.name,
          email: menteeData.email,
          password: hashedPassword,
          role: 'MENTEE',
          bio: menteeData.bio,
          skills: menteeData.skills as Skill[],
          experienceLevel: menteeData.experienceLevel as ExperienceLevel,
          company: menteeData.company,
          title: menteeData.title,
          school: menteeData.school,
          location: menteeData.location,
          languages: ['English'],
          availability: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
          timeAvailability: ['EVENING'],
          profileComplete: true,
          mentee: {
            create: {
              goals: menteeData.goals as Goal[],
              detailedGoals: menteeData.detailedGoals,
            }
          }
        },
        include: {
          mentee: true
        }
      });

      console.log(`✅ Created successfully!`);
      console.log(`   Goals: ${menteeData.goals.join(', ')}`);
      console.log(`   Skills: ${menteeData.skills.join(', ')}`);
      console.log(`   Detailed Goals: ${menteeData.detailedGoals.substring(0, 100)}...`);

      successCount++;
    } catch (error) {
      console.error(`❌ Error creating ${menteeData.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n🎉 Mentee Creation Complete!`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total mentees in database: ${await prisma.mentee.count()}`);
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Test Account Credentials:');
  console.log('   All passwords: Test123!\n');

  newMentees.forEach(m => {
    const category = m.email.split('.')[1].split('@')[0].toUpperCase();
    console.log(`   ${category.padEnd(12)} - ${m.email.padEnd(30)} (${m.name})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
